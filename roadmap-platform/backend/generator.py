import os
import json
from typing import List, Dict
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from dotenv import load_dotenv

load_dotenv()

def generate_roadmap_tasks(onboarding_data: Dict, knowledge_base=None) -> List[Dict]:
    """
    Given onboarding JSON, uses an LLM to generate a sequence of Tasks.
    Grounds the generation in the knowledge base if provided.
    """
    model = ChatOpenAI(model=os.getenv("CODIFY_MODEL", "gpt-4o-mini"), temperature=0.7)
    
    # RAG Retrieval
    retrieved_context = ""
    if knowledge_base:
        query_text = f"{onboarding_data.get('targetRole', '')} {onboarding_data.get('experienceLevel', '')} {onboarding_data.get('goals', '')}"
        results = knowledge_base.query(query_text, top_k=5)
        retrieved_context = "\n---\n".join([r['content'] for r in results])

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
    
    Return ONLY a JSON array of task objects.
    """

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("user", "User Data: {user_data}")
    ])

    chain = prompt | model | parser
    
    tasks = chain.invoke({"user_data": json.dumps(onboarding_data)})
    
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
    retrieved_context = ""
    if knowledge_base:
        results = knowledge_base.query(feedback, top_k=3)
        retrieved_context = "\n---\n".join([r['content'] for r in results])

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
    
    for i, task in enumerate(tasks):
        task['order'] = i
        
    return tasks

