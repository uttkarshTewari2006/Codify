import requests
import json
import os

# Manual test for generate-plan
# Use a dummy user_id or try to find a real one
# For testing purpose, we can try to find an existing user id from the DB

frontend_app_url = (
    os.environ.get("FRONTEND_APP_URL")
    or os.environ.get("NEXTAUTH_URL")
)

if not frontend_app_url:
    raise SystemExit("Set FRONTEND_APP_URL or NEXTAUTH_URL before running this script.")

backend_url = f"{frontend_app_url.rstrip('/')}/api/backend"
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
