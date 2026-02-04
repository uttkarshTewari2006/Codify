from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

# Your first endpoint
@app.get("/")
def read_root():
    return {"message": "Roadmap API is alive!"}

# A slightly useful endpoint
@app.get("/tracks")
def get_tracks():
    # Hardcoded for now - we'll add database later
    return [
        {"id": 1, "name": "LeetCode Mastery", "icon": "💻"},
        {"id": 2, "name": "Project Building", "icon": "🚀"},
        {"id": 3, "name": "System Design", "icon": "🏗️"},
    ]