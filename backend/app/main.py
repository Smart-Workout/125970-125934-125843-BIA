from fastapi import FastAPI                                                # FastAPI creates the backend application object.
from fastapi.middleware.cors import CORSMiddleware                         # CORS allows frontend dev servers to call the API locally.

from app.api.v1 import chat, dashboard, health, workout                    # Versioned routers keep endpoint groups organized.


app = FastAPI(
    title="Smart Workout API",                                             # API title appears in the automatic OpenAPI docs.
    description="Decision support and BI API for personalized workout planning.", # Description explains the project role of the backend.
    version="0.2.0",                                                       # Version marks the Week 2 ML/RAG update.
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[                                                        # Common local frontend ports are allowed during development.
        "http://localhost:3000",                                           # React/Next.js default development port.
        "http://localhost:3001",                                           # Backup frontend development port.
        "http://localhost:5173",                                           # Vite development server port.
    ],
    allow_credentials=True,                                                # Credentials are allowed for future authenticated endpoints.
    allow_methods=["*"],                                                   # All HTTP methods are allowed for local development.
    allow_headers=["*"],                                                   # All request headers are allowed for local development.
)

app.include_router(health.router, prefix="/api/v1")                        # Health endpoints verify that the API and data paths are available.
app.include_router(workout.router, prefix="/api/v1")                       # Workout endpoints expose preprocessing, prediction, and planning logic.
app.include_router(dashboard.router, prefix="/api/v1")                     # Dashboard endpoint exposes BI summary data.
app.include_router(chat.router, prefix="/api/v1")                          # Chat endpoint exposes retrieval-only RAG output.


@app.get("/")
def root() -> dict[str, str]:
    return {"name": "Smart Workout API", "status": "ok"}                   # Root route gives a quick browser-friendly API status check.
