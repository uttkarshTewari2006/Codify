from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from auth import get_user_id

app = FastAPI()

# Allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Roadmap API is alive!"}


@app.get("/me")
def get_me(user_id: str = Depends(get_user_id)):
    """Protected: returns current user id from JWT. Requires Authorization: Bearer <token>."""
    return {"user_id": user_id}


@app.get("/tracks")
def get_tracks():
    # Hardcoded for now - we'll add database later
    return [
        {"id": 1, "name": "LeetCode Mastery", "icon": "💻"},
        {"id": 2, "name": "Project Building", "icon": "🚀"},
        {"id": 3, "name": "System Design", "icon": "🏗️"},
    ]