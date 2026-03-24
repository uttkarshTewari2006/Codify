from generator import generate_roadmap_tasks
import json
import os
from dotenv import load_dotenv

load_dotenv()

def test_gen():
    print(f"Checking API Key: {'Set' if os.getenv('OPENAI_API_KEY') else 'NOT SET'}")
    
    sample_data = {
        "level": "intermediate",
        "targetRole": "Frontend Engineer",
        "timeline": "3 months",
        "struggles": ["interviews", "projects"],
        "networkingOnline": 50,
        "networkingInPerson": 20,
        "additionalInfo": "I want to learn React and Next.js deeply."
    }
    
    try:
        print("Generating tasks...")
        tasks = generate_roadmap_tasks(sample_data)
        print(f"Successfully generated {len(tasks)} tasks.")
        print(json.dumps(tasks[:2], indent=2))
        return True
    except Exception as e:
        print(f"Generation failed: {e}")
        return False

if __name__ == "__main__":
    test_gen()
