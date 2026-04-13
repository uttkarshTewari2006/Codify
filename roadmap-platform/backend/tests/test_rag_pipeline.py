import pytest
import respx
from httpx import Response
from main import app
from fastapi.testclient import TestClient
import json

client = TestClient(app)

@respx.mock
def test_generate_plan_with_rag_mocked():
    # Mock OpenAI API for generation
    respx.post("https://api.openai.com/v1/chat/completions").mock(return_value=Response(
        200, 
        json={
            "choices": [{
                "message": {
                    "content": json.dumps([
                        {
                            "title": "Learn React",
                            "description": "Standard React stuff",
                            "duration": "1 week",
                            "type": "info",
                            "order": 1,
                            "deliverables": ["Hello World"],
                            "links": ["https://reactjs.org"]
                        }
                    ])
                }
            }]
        }
    ))
    
    # Mock JWT ID
    with pytest.MonkeyPatch.context() as m:
        m.setattr("main.get_user_id", lambda: "test-user-id")
        
        # Call the endpoint
        response = client.post("/generate-plan", json={
            "targetRole": "Frontend Developer",
            "experienceLevel": "Beginner",
            "learningPace": "Fast"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert "roadmap_id" in data
        assert data["message"] == "Plan generated successfully"
