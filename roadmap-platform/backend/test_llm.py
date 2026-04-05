import os
import json
from generator import generate_roadmap_tasks

onboarding_data = {
    "targetRole": "Software Engineer",
    "experience": "Junior",
    "goals": ["Learn React", "Learn Python"]
}

try:
    print("Testing generate_roadmap_tasks...")
    tasks = generate_roadmap_tasks(onboarding_data)
    print(f"Generated {len(tasks)} tasks.")
    print("First task:", tasks[0]['title'])
except Exception as e:
    print(f"Error: {e}")
