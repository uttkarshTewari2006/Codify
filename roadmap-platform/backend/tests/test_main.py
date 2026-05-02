from datetime import datetime, timedelta

from fastapi.testclient import TestClient
from sqlmodel import Session, select

from database import FeedbackLog, Roadmap, Task, User


def test_read_root(client: TestClient):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Roadmap API is alive!"}


def test_generate_plan(client: TestClient, session: Session):
    user = User(id="test-user-id", email="test@example.com", onboarded=True)
    session.add(user)
    session.commit()

    onboarding_data = {
        "targetRole": "Frontend Engineer",
        "experienceLevel": "Beginner",
        "goals": "Learn React",
    }
    response = client.post("/generate-plan", json=onboarding_data)
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Plan generated successfully"
    assert "roadmap_id" in data

    roadmap = session.get(Roadmap, data["roadmap_id"])
    assert roadmap is not None
    assert roadmap.title == "Frontend Engineer Roadmap"

    tasks = session.exec(select(Task).where(Task.roadmapId == roadmap.id)).all()
    assert len(tasks) == 2
    assert tasks[0].title == "Test Task 1"


def test_get_roadmaps(client: TestClient, session: Session):
    user = User(id="test-user-id", email="test@example.com")
    session.add(user)
    roadmap = Roadmap(id="r1", title="Test Roadmap", userId="test-user-id")
    session.add(roadmap)
    session.commit()

    response = client.get("/roadmaps")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["title"] == "Test Roadmap"


def test_get_roadmap_details(client: TestClient, session: Session):
    user = User(id="test-user-id", email="test@example.com")
    session.add(user)
    roadmap = Roadmap(id="r1", title="Test Roadmap", userId="test-user-id")
    session.add(roadmap)
    task = Task(id="t1", title="Task 1", roadmapId="r1", order=0)
    session.add(task)
    session.commit()

    response = client.get("/roadmaps/r1")
    assert response.status_code == 200
    data = response.json()
    assert data["roadmap"]["title"] == "Test Roadmap"
    assert len(data["tasks"]) == 1


def test_create_deadline(client: TestClient, session: Session):
    user = User(id="test-user-id", email="test@example.com")
    session.add(user)
    session.commit()

    deadline_data = {
        "title": "Finish React Course",
        "targetDate": (datetime.utcnow() + timedelta(days=7)).isoformat(),
        "type": "general",
    }
    response = client.post("/deadlines", json=deadline_data)
    assert response.status_code == 200
    assert response.json()["title"] == "Finish React Course"


def test_fork_curated_roadmap(client: TestClient, session: Session):
    user = User(id="test-user-id", email="test@example.com")
    session.add(user)
    session.commit()

    payload = {
        "roadmap": {
            "roadmap_title": "Curated Path",
            "description": "A curated path",
            "tasks": [
                {"title": "Step 1", "description": "Desc 1", "duration": "1h", "type": "info"}
            ],
        }
    }
    response = client.post("/roadmaps/fork-curated", json=payload)
    assert response.status_code == 200
    assert response.json()["title"] == "Curated Path"

    roadmap_id = response.json()["id"]
    tasks = session.exec(select(Task).where(Task.roadmapId == roadmap_id)).all()
    assert len(tasks) == 1
    assert tasks[0].title == "Step 1"


def test_update_task(client: TestClient, session: Session):
    user = User(id="test-user-id", email="test@example.com")
    session.add(user)
    roadmap = Roadmap(id="r1", title="Test Roadmap", userId="test-user-id")
    session.add(roadmap)
    task = Task(id="t1", title="Old Task", roadmapId="r1", order=0, deliverables=[])
    session.add(task)
    session.commit()

    update_data = {
        "title": "New Task Title",
        "deliverables": [{"title": "Subtask 1", "completed": True}],
    }
    response = client.patch("/roadmaps/r1/edit-task/t1", json=update_data)
    assert response.status_code == 200
    assert response.json()["title"] == "New Task Title"
    assert response.json()["deliverables"][0]["completed"] is True
    assert response.json()["status"] == "completed"


def test_delete_roadmap(client: TestClient, session: Session):
    user = User(id="test-user-id", email="test@example.com")
    session.add(user)
    roadmap = Roadmap(id="r1", title="To Delete", userId="test-user-id")
    session.add(roadmap)
    session.commit()

    response = client.delete("/roadmaps/r1")
    assert response.status_code == 200
    assert response.json() == {"message": "Roadmap deleted"}

    assert session.get(Roadmap, "r1") is None


def test_regenerate_plan_logs_feedback(client: TestClient, session: Session):
    user = User(id="test-user-id", email="test@example.com", isAdmin=True)
    session.add(user)
    roadmap = Roadmap(id="r1", title="Test Roadmap", userId="test-user-id")
    session.add(roadmap)
    session.commit()

    response = client.post(
        "/roadmaps/r1/regenerate",
        json={"dashboard": {"title": "Existing"}, "feedback": "Keep explicit source links"},
    )
    assert response.status_code == 200

    logs = session.exec(select(FeedbackLog).where(FeedbackLog.roadmapId == "r1")).all()
    assert len(logs) == 1
    assert logs[0].feedback == "Keep explicit source links"

    admin_feedback = client.get("/admin/feedback")
    assert admin_feedback.status_code == 200
    payload = admin_feedback.json()
    assert payload["count"] == 1
    assert payload["items"][0]["feedback"] == "Keep explicit source links"
