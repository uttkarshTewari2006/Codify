import sys
import uuid
from datetime import datetime
from sqlmodel import Session, select
from database import engine, Roadmap, Task

def test_insertion():
    print("Testing DB insertion...")
    with Session(engine) as session:
        try:
            roadmap_id = str(uuid.uuid4())
            roadmap = Roadmap(
                id=roadmap_id,
                title="Test Roadmap",
                description="Testing insertion",
                userId="Xu8hZfXEvu" # Use existing user id from logs
            )
            session.add(roadmap)
            session.commit()
            print("Roadmap inserted.")
            
            task = Task(
                id=str(uuid.uuid4()),
                title="Test Task",
                description="Testing description",
                duration="1 hour",
                type="info",
                order=0,
                deliverables=[{"title": "Check 1", "completed": False, "completedAt": None}],
                links=["http://example.com"],
                roadmapId=roadmap_id
            )
            session.add(task)
            session.commit()
            print("Task inserted.")
            
            # Clean up
            session.delete(task)
            session.delete(roadmap)
            session.commit()
            print("Cleanup successful.")
        except Exception as e:
            print(f"Error: {e}")
            session.rollback()

if __name__ == "__main__":
    test_insertion()
