from sqlmodel import SQLModel, create_engine, Session, Field, Relationship
from sqlalchemy import Column, JSON
from typing import List, Optional
from datetime import datetime
import os

# Connect to the same SQLite DB used by Prisma
DATABASE_URL = "sqlite:///../frontend/codify/prisma/dev.db"
engine = create_engine(DATABASE_URL, echo=True)

class User(SQLModel, table=True):
    __tablename__ = "User"
    id: str = Field(primary_key=True)
    email: str
    name: Optional[str] = None
    onboarded: bool = False
    roadmaps: List["Roadmap"] = Relationship(back_populates="user")
    deadlines: List["Deadline"] = Relationship(back_populates="user")

class Roadmap(SQLModel, table=True):
    __tablename__ = "Roadmap"
    id: str = Field(primary_key=True)
    title: str
    description: Optional[str] = None
    userId: str = Field(foreign_key="User.id")
    user: User = Relationship(back_populates="roadmaps")
    tasks: List["Task"] = Relationship(back_populates="roadmap")
    deadlines: List["Deadline"] = Relationship(back_populates="roadmap")
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class Task(SQLModel, table=True):
    __tablename__ = "Task"
    id: str = Field(primary_key=True)
    title: str
    description: Optional[str] = None
    duration: Optional[str] = None
    type: str = Field(default="info") # problem, guide, info, goal
    status: str = Field(default="todo")
    # deliverables is a list of objects: {"title": str, "completed": bool, "completedAt": Optional[str]}
    deliverables: Optional[List[dict]] = Field(default=None, sa_column=Column(JSON))
    links: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    roadmapId: str = Field(foreign_key="Roadmap.id")
    roadmap: Roadmap = Relationship(back_populates="tasks")
    deadlines: List["Deadline"] = Relationship(back_populates="task")
    order: int
    completedAt: Optional[datetime] = Field(default=None)
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class Deadline(SQLModel, table=True):
    __tablename__ = "Deadline"
    id: str = Field(primary_key=True)
    title: str
    description: Optional[str] = None
    targetDate: datetime
    status: str = Field(default="pending") # pending, completed, overdue
    
    # Target linking
    type: str = Field(default="general") # roadmap, task, deliverable, general
    roadmapId: Optional[str] = Field(default=None, foreign_key="Roadmap.id")
    taskId: Optional[str] = Field(default=None, foreign_key="Task.id")
    deliverableId: Optional[int] = Field(default=None) # Index in task deliverables
    
    userId: str = Field(foreign_key="User.id")
    
    user: User = Relationship(back_populates="deadlines")
    roadmap: Optional[Roadmap] = Relationship(back_populates="deadlines")
    task: Optional[Task] = Relationship(back_populates="deadlines")
    
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

def get_session():
    with Session(engine) as session:
        yield session
