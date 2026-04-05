import requests
import json

# Manual test for generate-plan
# Use a dummy user_id or try to find a real one
# For testing purpose, we can try to find an existing user id from the DB

backend_url = "http://localhost:3000/api/backend"
# This might fail due to lack of JWT but we are just checking if it crashes or returns 401/403

onboarding_data = {
    "targetRole": "Software Engineer",
    "experience": "Junior",
    "goals": ["Learn React", "Learn Python"]
}

try:
    # Need to simulate auth or find a way around it for testing
    # Actually, fetchBackend in frontend adds the Bearer token.
    # Without token, it should return 401.
    res = requests.post(f"{backend_url}/generate-plan", json=onboarding_data)
    print(f"Status Code: {res.status_code}")
    print(f"Response: {res.text}")
except Exception as e:
    print(f"Error: {e}")
