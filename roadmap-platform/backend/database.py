import os
from datetime import datetime
from typing import List, Optional

from sqlalchemy import Column, JSON
from sqlmodel import Field, Relationship, SQLModel, Session, create_engine

DEFAULT_DATABASE_URL = os.getenv(
    "DEFAULT_DATABASE_URL",
    "postgresql://codify:codify@localhost:5432/codify",
)


def normalize_database_url(database_url: str) -> str:
    if database_url.startswith("postgresql://"):
        return database_url.replace("postgresql://", "postgresql+psycopg://", 1)
    return database_url

DATABASE_URL = normalize_database_url(os.getenv("DATABASE_URL", DEFAULT_DATABASE_URL))
SQL_ECHO = os.getenv("SQL_ECHO", "false").lower() in {"1", "true", "yes", "on"}
CONNECT_ARGS = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    echo=SQL_ECHO,
    connect_args=CONNECT_ARGS,
    pool_pre_ping=not DATABASE_URL.startswith("sqlite"),
)


class User(SQLModel, table=True):
    __tablename__ = "User"
    id: str = Field(primary_key=True)
    email: str
    name: Optional[str] = None
    onboarded: bool = False
    isAdmin: bool = Field(default=False)
    roadmaps: List["Roadmap"] = Relationship(back_populates="user")
    deadlines: List["Deadline"] = Relationship(back_populates="user")
    feedbackLogs: List["FeedbackLog"] = Relationship(back_populates="user")


class Roadmap(SQLModel, table=True):
    __tablename__ = "Roadmap"
    id: str = Field(primary_key=True)
    title: str
    description: Optional[str] = None
    userId: str = Field(foreign_key="User.id")
    user: User = Relationship(back_populates="roadmaps")
    tasks: List["Task"] = Relationship(back_populates="roadmap")
    deadlines: List["Deadline"] = Relationship(back_populates="roadmap")
    feedbackLogs: List["FeedbackLog"] = Relationship(back_populates="roadmap")
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)


class Task(SQLModel, table=True):
    __tablename__ = "Task"
    id: str = Field(primary_key=True)
    title: str
    description: Optional[str] = None
    duration: Optional[str] = None
    type: str = Field(default="info")  # problem, guide, info, goal
    status: str = Field(default="todo")
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
    status: str = Field(default="pending")  # pending, completed, overdue
    type: str = Field(default="general")  # roadmap, task, deliverable, general
    roadmapId: Optional[str] = Field(default=None, foreign_key="Roadmap.id")
    taskId: Optional[str] = Field(default=None, foreign_key="Task.id")
    deliverableId: Optional[int] = Field(default=None)
    userId: str = Field(foreign_key="User.id")
    user: User = Relationship(back_populates="deadlines")
    roadmap: Optional[Roadmap] = Relationship(back_populates="deadlines")
    task: Optional[Task] = Relationship(back_populates="deadlines")
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)


class FeedbackLog(SQLModel, table=True):
    __tablename__ = "FeedbackLog"
    id: str = Field(primary_key=True)
    userId: str = Field(foreign_key="User.id", index=True)
    roadmapId: str = Field(foreign_key="Roadmap.id", index=True)
    feedback: str
    createdAt: datetime = Field(default_factory=datetime.utcnow, index=True)
    user: User = Relationship(back_populates="feedbackLogs")
    roadmap: Roadmap = Relationship(back_populates="feedbackLogs")


def get_session():
    with Session(engine) as session:
        yield session
