from copy import deepcopy
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, StaticPool, create_engine

import main
from auth import get_user_id
from database import get_session

SQLALCHEMY_DATABASE_URL = "sqlite://"

SAMPLE_GENERATED_TASKS = [
    {
        "title": "Test Task 1",
        "description": "Description 1",
        "duration": "1 hour",
        "type": "info",
        "deliverables": ["Deliverable 1"],
        "links": ["https://example.com"],
        "order": 0,
    },
    {
        "title": "Test Task 2",
        "description": "Description 2",
        "duration": "2 hours",
        "type": "goal",
        "deliverables": ["Deliverable 2"],
        "links": [],
        "order": 1,
    },
]

SAMPLE_REGENERATED_TASKS = [
    {
        "title": "Updated Task",
        "description": "Updated description",
        "duration": "90 minutes",
        "type": "guide",
        "deliverables": ["Updated deliverable"],
        "links": ["https://roadmap.sh/full-stack"],
        "order": 0,
    }
]


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
def client_fixture(session: Session, monkeypatch: pytest.MonkeyPatch):
    def get_session_override():
        return session

    def get_user_id_override():
        return "test-user-id"

    kb_mock = MagicMock()
    kb_mock.is_available.return_value = True
    kb_mock.query.return_value = []
    kb_mock.get_stats.return_value = {
        "available": True,
        "total_chunks": 0,
        "collection_name": "roadmap_knowledge",
        "persist_directory": "./chroma_db",
    }

    monkeypatch.setattr(main, "kb", kb_mock)
    monkeypatch.setattr(
        main,
        "generate_roadmap_tasks",
        lambda onboarding_data, knowledge_base=None: deepcopy(SAMPLE_GENERATED_TASKS),
    )
    monkeypatch.setattr(
        main,
        "regenerate_roadmap_tasks",
        lambda existing_dashboard, feedback, knowledge_base=None: deepcopy(SAMPLE_REGENERATED_TASKS),
    )

    main.app.dependency_overrides[get_session] = get_session_override
    main.app.dependency_overrides[get_user_id] = get_user_id_override

    client = TestClient(main.app)
    yield client
    main.app.dependency_overrides.clear()
