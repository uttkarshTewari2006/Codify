import os
import json
import re
from typing import List, Dict, Iterable, Set
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from dotenv import load_dotenv

load_dotenv()

URL_PATTERN = re.compile(r"https?://[^\s)\]>\"']+")


def extract_urls(value) -> List[str]:
    if value is None:
        return []
    if isinstance(value, str):
        return [url.rstrip(".,;:") for url in URL_PATTERN.findall(value)]
    if isinstance(value, list):
        urls: List[str] = []
        for item in value:
            urls.extend(extract_urls(item))
        return list(dict.fromkeys(urls))
    if isinstance(value, dict):
        urls: List[str] = []
        for item in value.values():
            urls.extend(extract_urls(item))
        return list(dict.fromkeys(urls))
    return []


def collect_allowed_urls(results: Iterable[Dict], existing_roadmap: Dict | None = None) -> Set[str]:
    allowed_urls: Set[str] = set()

    for result in results or []:
        metadata = result.get("metadata", {}) if isinstance(result, dict) else {}
        allowed_urls.update(extract_urls(metadata.get("urls")))
        allowed_urls.update(extract_urls(result.get("content")))

    if existing_roadmap:
        allowed_urls.update(extract_urls(existing_roadmap))

    return allowed_urls


def format_retrieved_context(results: Iterable[Dict]) -> str:
    sections: List[str] = []

    for result in results or []:
        content = (result.get("content") or "").strip()
        metadata = result.get("metadata", {}) if isinstance(result, dict) else {}
        source = metadata.get("source", "unknown")
        urls = extract_urls(metadata.get("urls")) or extract_urls(content)

        section_lines = [f"Source: {source}", content]
        if urls:
            section_lines.append("Source URLs:")
            section_lines.extend(f"- {url}" for url in urls)
        sections.append("\n".join(section_lines).strip())

    return "\n---\n".join(section for section in sections if section)


def sanitize_task_links(tasks: List[Dict], allowed_urls: Set[str]) -> List[Dict]:
    for task in tasks:
        raw_links = task.get("links", [])
        sanitized_links: List[str] = []
        for candidate in extract_urls(raw_links):
            if candidate in allowed_urls and candidate not in sanitized_links:
                sanitized_links.append(candidate)
        task["links"] = sanitized_links
    return tasks

def generate_roadmap_tasks(onboarding_data: Dict, knowledge_base=None) -> List[Dict]:
    """
    Given onboarding JSON, uses an LLM to generate a sequence of Tasks.
    Grounds the generation in the knowledge base if provided.
    """
    model = ChatOpenAI(model=os.getenv("CODIFY_MODEL", "gpt-4o-mini"), temperature=0.7)
    
    # RAG Retrieval
    retrieved_results: List[Dict] = []
    retrieved_context = ""
    allowed_urls: Set[str] = set()
    if knowledge_base:
        query_text = f"{onboarding_data.get('targetRole', '')} {onboarding_data.get('experienceLevel', '')} {onboarding_data.get('goals', '')}"
        retrieved_results = knowledge_base.query(query_text, top_k=5)
        retrieved_context = format_retrieved_context(retrieved_results)
        allowed_urls = collect_allowed_urls(retrieved_results)

    parser = JsonOutputParser()

    system_prompt = f"""
    You are an expert career coach and technical mentor. 
    Your goal is to build a highly personalized learning roadmap for a software engineer.
    
    {'REFERENCE CONTEXT FROM PROVEN ROADMAPS:' if retrieved_context else ''}
    {retrieved_context if retrieved_context else ''}

    Based on the user's data and the reference context provided above, generate a sequence of EXCISE and ACTIONABLE tasks.
    Each task MUST have:
    - title: A short, catchy name for the task.
    - description: A detailed but concise explanation of what to do.
    - duration: Estimated time to complete (e.g., "2 hours", "3 days").
    - type: One of [problem, guide, info, goal].
    - deliverables: An array of strings representing actionable checklist items for the task.
    - links: An array of strings containing relevant external URLs or learning resources.
    
    Constraints:
    - 'problem' is for DSA or specific coding challenges.
    - 'guide' is for in-depth project steps or "how-to".
    - 'info' is for learning concepts or guidance (e.g., cold messaging).
    - 'goal' is for a milestone (e.g., "Apply to 5 companies").
    - IMPORTANT: For the 'links' array, you MUST ONLY use URLs that are explicitly provided in the REFERENCE CONTEXT. Do not invent, guess, or hallucinate any links. If no relevant links are in the context, leave the 'links' array empty.
    
    Return ONLY a JSON array of task objects.
    """

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("user", "User Data: {user_data}")
    ])

    chain = prompt | model | parser
    
    tasks = chain.invoke({"user_data": json.dumps(onboarding_data)})
    tasks = sanitize_task_links(tasks, allowed_urls)
    
    # Ensure all tasks have an 'order' field
    for i, task in enumerate(tasks):
        task['order'] = i
        
    return tasks

def regenerate_roadmap_tasks(existing_roadmap: Dict, feedback: str, knowledge_base=None) -> List[Dict]:
    """
    Given an existing roadmap and user feedback, regenerate the tasks using an LLM.
    Specifically addresses "dislikes" in the feedback.
    """
    model = ChatOpenAI(model=os.getenv("CODIFY_MODEL", "gpt-4o-mini"), temperature=0.7)
    
    # RAG Retrieval for regeneration context
    retrieved_results: List[Dict] = []
    retrieved_context = ""
    if knowledge_base:
        retrieved_results = knowledge_base.query(feedback, top_k=3)
        retrieved_context = format_retrieved_context(retrieved_results)

    allowed_urls = collect_allowed_urls(retrieved_results, existing_roadmap=existing_roadmap)

    parser = JsonOutputParser()

    system_prompt = f"""
    You are an expert career coach and technical mentor. 
    The user wants to REGENERATE their existing learning roadmap based on their specific feedback.
    
    {'REFERENCE CONTEXT:' if retrieved_context else ''}
    {retrieved_context if retrieved_context else ''}

    You will be provided with:
    1. The existing roadmap (title, description, and list of current tasks).
    2. The user's feedback explaining what they want to change or what they DID NOT like.
    
    Your goal is to adjust the existing plan according to the feedback (prioritizing fixing things they didn't like), and output the NEW sequence of ACTIONABLE tasks.
    Each task MUST have:
    - title: A short, catchy name for the task.
    - description: A detailed but concise explanation of what to do.
    - duration: Estimated time to complete (e.g., "2 hours", "3 days").
    - type: One of [problem, guide, info, goal].
    - deliverables: An array of strings representing actionable checklist items for the task.
    - links: An array of strings containing relevant external URLs or learning resources.
    
    Constraints:
    - 'problem' is for DSA or specific coding challenges.
    - 'guide' is for in-depth project steps or "how-to".
    - 'info' is for learning concepts or guidance (e.g., cold messaging).
    - 'goal' is for a milestone (e.g., "Apply to 5 companies").
    - IMPORTANT: For the 'links' array, you MUST ONLY use URLs that are explicitly provided in the REFERENCE CONTEXT or the Existing Roadmap. Do not invent, guess, or hallucinate any new links. If no relevant links exist, leave the 'links' array empty.
    
    Return ONLY a JSON array of task objects.
    """

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("user", "Existing Roadmap:\n{existing_roadmap}\n\nUser Feedback:\n{feedback}")
    ])

    chain = prompt | model | parser
    
    tasks = chain.invoke({
        "existing_roadmap": json.dumps(existing_roadmap),
        "feedback": feedback
    })
    tasks = sanitize_task_links(tasks, allowed_urls)
    
    for i, task in enumerate(tasks):
        task['order'] = i
        
    return tasks

