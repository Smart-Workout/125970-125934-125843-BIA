from fastapi import FastAPI                                                # FastAPI creates the backend application object.
from fastapi.middleware.cors import CORSMiddleware                         # CORS allows frontend dev servers to call the API locally.

from app.api.v1 import chat, dashboard, health, workout                    # Versioned routers keep endpoint groups organized.
from app.core.config import settings                                       # Shared settings include deployment CORS allowlist overrides.


app = FastAPI(
    title="Smart Workout API",                                             # API title appears in the automatic OpenAPI docs.
    description="Decision support and BI API for personalized workout planning.", # Description explains the project role of the backend.
    version="0.2.0",                                                       # Version marks the Week 2 ML/RAG update.
)

local_origins = [                                                          # Local origins keep developer workflow unchanged.
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    "http://127.0.0.1:3001",
    "http://localhost:3001",
    "http://127.0.0.1:5173",
    "http://localhost:5173",
    "http://127.0.0.1:5174",
    "http://localhost:5174",
    "http://127.0.0.1:4173",
    "http://localhost:4173",
]
configured_origins = [
    origin.strip() for origin in settings.CORS_ALLOW_ORIGINS.split(",") if origin.strip()
]
allow_origins = list(dict.fromkeys([*local_origins, *configured_origins])) # Deduplicate while preserving order.

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
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
