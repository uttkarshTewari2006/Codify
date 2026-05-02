from __future__ import annotations

from datetime import datetime, timedelta

from sqlmodel import Session, select

from database import Deadline, FeedbackLog, Roadmap, Task, User, engine
from knowledge_base import KnowledgeBase

GOLDEN_USER_ID = "golden-admin-user"
GOLDEN_ROADMAP_ID = "golden-roadmap"
GOLDEN_FEEDBACK_ID = "golden-feedback"
GOLDEN_DEADLINE_ID = "golden-deadline"

GOLDEN_TASKS = [
    {
        "id": "golden-task-01",
        "title": "Map the API surface",
        "description": "Read the FastAPI routes and identify the user-facing roadmap flows.",
        "duration": "2 hours",
        "type": "info",
        "order": 0,
        "deliverables": [
            {"title": "List the main roadmap endpoints", "completed": False, "completedAt": None},
            {"title": "Document auth assumptions", "completed": False, "completedAt": None},
        ],
        "links": [
            "https://fastapi.tiangolo.com/tutorial/",
            "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview",
        ],
    },
    {
        "id": "golden-task-02",
        "title": "Trace the RAG inputs",
        "description": "Inspect the knowledge documents and verify which source URLs are available to the generator.",
        "duration": "3 hours",
        "type": "guide",
        "order": 1,
        "deliverables": [
            {"title": "Review the seed knowledge docs", "completed": False, "completedAt": None},
            {"title": "Confirm retrieved links stay in generated output", "completed": False, "completedAt": None},
        ],
        "links": [
            "https://roadmap.sh/backend/projects",
            "https://roadmap.sh/full-stack",
        ],
    },
]


def upsert_user(session: Session) -> None:
    user = session.get(User, GOLDEN_USER_ID)
    if not user:
        user = User(
            id=GOLDEN_USER_ID,
            email="admin@codify.local",
            name="Codify Admin",
            onboarded=True,
            isAdmin=True,
        )
    else:
        user.email = "admin@codify.local"
        user.name = "Codify Admin"
        user.onboarded = True
        user.isAdmin = True
    session.add(user)


def replace_roadmap_data(session: Session) -> None:
    roadmap = session.get(Roadmap, GOLDEN_ROADMAP_ID)
    if not roadmap:
        roadmap = Roadmap(
            id=GOLDEN_ROADMAP_ID,
            title="Golden Full-Stack Bootstrap",
            description="Minimal seeded roadmap used to verify SQL bootstrap and admin feedback flows.",
            userId=GOLDEN_USER_ID,
        )
    else:
        roadmap.title = "Golden Full-Stack Bootstrap"
        roadmap.description = "Minimal seeded roadmap used to verify SQL bootstrap and admin feedback flows."
        roadmap.userId = GOLDEN_USER_ID
    session.add(roadmap)
    session.flush()

    for task in session.exec(select(Task).where(Task.roadmapId == GOLDEN_ROADMAP_ID)).all():
        session.delete(task)
    for deadline in session.exec(select(Deadline).where(Deadline.roadmapId == GOLDEN_ROADMAP_ID)).all():
        session.delete(deadline)
    for log in session.exec(select(FeedbackLog).where(FeedbackLog.roadmapId == GOLDEN_ROADMAP_ID)).all():
        session.delete(log)
    session.flush()

    for task_data in GOLDEN_TASKS:
        session.add(
            Task(
                id=task_data["id"],
                title=task_data["title"],
                description=task_data["description"],
                duration=task_data["duration"],
                type=task_data["type"],
                order=task_data["order"],
                deliverables=task_data["deliverables"],
                links=task_data["links"],
                roadmapId=GOLDEN_ROADMAP_ID,
            )
        )

    session.add(
        Deadline(
            id=GOLDEN_DEADLINE_ID,
            title="Validate seeded roadmap",
            description="Confirm the seeded roadmap, feedback log, and RAG index are available.",
            targetDate=datetime.utcnow() + timedelta(days=14),
            type="roadmap",
            roadmapId=GOLDEN_ROADMAP_ID,
            userId=GOLDEN_USER_ID,
        )
    )

    session.add(
        FeedbackLog(
            id=GOLDEN_FEEDBACK_ID,
            userId=GOLDEN_USER_ID,
            roadmapId=GOLDEN_ROADMAP_ID,
            feedback="Prefer roadmap tasks that keep explicit source URLs in the output.",
        )
    )


def seed_chroma() -> None:
    kb = KnowledgeBase()
    if not kb.is_available():
        raise RuntimeError(kb.get_unavailable_reason())
    kb.ingest_knowledge_docs(replace_existing=True)


def main() -> None:
    with Session(engine) as session:
        upsert_user(session)
        replace_roadmap_data(session)
        session.commit()

    seed_chroma()
    print("Golden SQL data and Chroma index seeded successfully.")


if __name__ == "__main__":
    main()
