import os
import json
from knowledge_base import KnowledgeBase
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from dotenv import load_dotenv

load_dotenv()

def validate_rag():
    kb = KnowledgeBase()
    judge = ChatOpenAI(model="gpt-4o")
    
    test_cases = [
        "Backend Developer roadmap focusing on Python and FastAPI",
        "Frontend Masters with React and TailwindCSS",
        "DevOps Engineer path including Kubernetes and Terraform"
    ]
    
    results = []
    
    print("--- Starting Probabilistic RAG Validation ---")
    
    for case in test_cases:
        print(f"Testing Query: {case}")
        
        # 1. Retrieval
        context_chunks = kb.query(case, top_k=3)
        context_text = "\n---\n".join([c["content"] for c in context_chunks])
        
        # 2. Judgment
        prompt = f"""
        You are a quality control agent for an AI learning platform.
        We just performed a RAG (Retrieval Augmented Generation) retrieval for the query: "{case}"
        
        Here is the retrieved context from our knowledge base:
        {context_text}
        
        Evaluate the retrieval quality based on these metrics (Score 1-10):
        1. Context Relevance: How relevant are these chunks to the user's specific query?
        2. Depth: Do the chunks provide actionable technical steps or just definitions?
        3. Noise: How much of this retrieved info is irrelevant "fluff"?
        
        Provide your response in JSON format:
        {{
            "relevance_score": int,
            "depth_score": int,
            "noise_score": int,
            "summary": "Short explanation of the score"
        }}
        """
        
        response = judge.invoke([
            SystemMessage(content="You are a meticulous technical auditor."),
            HumanMessage(content=prompt)
        ])
        
        score = json.loads(response.content)
        results.append({
            "query": case,
            "scores": score
        })
        print(f"Result: {score['summary']}\n")

    # Final summary
    avg_relevance = sum(r["scores"]["relevance_score"] for r in results) / len(results)
    print(f"--- FInal Average Relevance: {avg_relevance}/10 ---")
    
    with open("rag_validation_report.json", "w") as f:
        json.dump(results, f, indent=2)

if __name__ == "__main__":
    if not os.environ.get("OPENAI_API_KEY"):
        print("Error: OPENAI_API_KEY not found in environment.")
    else:
        validate_rag()
