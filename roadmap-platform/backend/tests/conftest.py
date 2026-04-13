import sys
from unittest.mock import MagicMock

# Mock KnowledgeBase before main is imported
kb_mock = MagicMock()
kb_mock.query.return_value = []
kb_mock.get_stats.return_value = {"total_chunks": 0}
sys.modules["knowledge_base"] = MagicMock()
sys.modules["knowledge_base"].KnowledgeBase = MagicMock(return_value=kb_mock)

import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, create_engine, Session, StaticPool
from main import app, kb
from database import get_session
from auth import get_user_id
import respx
from httpx import Response
import json

app.kb = kb_mock

# Setup in-memory SQLite
SQLALCHEMY_DATABASE_URL = "sqlite://"

@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session

@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session

    def get_user_id_override():
        return "test-user-id"

    app.dependency_overrides[get_session] = get_session_override
    app.dependency_overrides[get_user_id] = get_user_id_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()

@pytest.fixture(autouse=True)
def mock_ai_calls():
    with respx.mock(base_url="https://api.openai.com/v1") as respx_mock:
        # Mock for ChatOpenAI (OpenAI API)
        respx_mock.post("/chat/completions").mock(return_value=Response(
            200, 
            json={
                "choices": [{
                    "message": {
                        "content": json.dumps([
                            {
                                "title": "Test Task 1",
                                "description": "Description 1",
                                "duration": "1 hour",
                                "type": "info",
                                "deliverables": ["Deliverable 1"],
                                "links": ["https://example.com"]
                            },
                            {
                                "title": "Test Task 2",
                                "description": "Description 2",
                                "duration": "2 hours",
                                "type": "goal",
                                "deliverables": ["Deliverable 2"],
                                "links": []
                            }
                        ])
                    }
                }]
            }
        ))
        
        # Mock for Groq if needed (though current code uses ChatOpenAI)
        respx_mock.post("https://api.groq.com/openai/v1/chat/completions").mock(return_value=Response(
            200,
            json={
                "choices": [{
                    "message": {
                        "content": "[]" # Placeholder
                    }
                }]
            }
        ))
        
        yield respx_mock
