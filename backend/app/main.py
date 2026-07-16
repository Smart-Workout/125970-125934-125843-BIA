import logging                                                            # Startup logs include optional warmup diagnostics.
import threading                                                          # Warmup runs in the background so API startup is not blocked.
from pathlib import Path                                                   # Build file-system paths for optional frontend static hosting.

from fastapi import FastAPI                                                # FastAPI creates the backend application object.
from fastapi.middleware.cors import CORSMiddleware                         # CORS allows frontend dev servers to call the API locally.
from fastapi.responses import FileResponse, JSONResponse                   # Serve compiled frontend files and fallback JSON responses.

from app.api.v1 import chat, dashboard, health, workout                    # Versioned routers keep endpoint groups organized.
from app.core.config import settings                                       # Shared settings include deployment CORS allowlist overrides.
from app.services.rag_service import warmup_retrieval_cache                # Preload retrieval cache to reduce first-request latency.


logger = logging.getLogger("uvicorn.error")                              # Use uvicorn logger for consistent backend diagnostics.


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


@app.on_event("startup")
def warmup_dependencies() -> None:
    def _run_warmup() -> None:
        warmup_retrieval_cache()                                           # Populate cached Chroma/model handles in the background.

    threading.Thread(target=_run_warmup, name="rag-warmup", daemon=True).start()
    logger.info("Started background RAG warmup thread")


FRONTEND_DIST_DIR = settings.PROJECT_ROOT / "frontend" / "dist"            # Single-service deployment serves the compiled Vite build from here.


def _serve_frontend_file(request_path: str = "") -> FileResponse | None:
    if not settings.SERVE_FRONTEND:
        return None                                                         # Static frontend should be served by a dedicated hosting service in split deployments.

    if not FRONTEND_DIST_DIR.exists():
        return None                                                         # Local backend-only runs can skip frontend static serving.

    normalized = (request_path or "").lstrip("/")
    if normalized:
        candidate = (FRONTEND_DIST_DIR / normalized).resolve()
        if candidate.is_file() and str(candidate).startswith(str(FRONTEND_DIST_DIR.resolve())):
            return FileResponse(candidate)

    index_path = FRONTEND_DIST_DIR / "index.html"
    if index_path.exists():
        return FileResponse(index_path)
    return None


@app.get("/")
def root() -> dict[str, str]:
    frontend_response = _serve_frontend_file()                              # In single-service mode, root serves the frontend application.
    if frontend_response is not None:
        return frontend_response
    return {"name": "Smart Workout API", "status": "ok"}                   # Fallback keeps backend-only usage behavior.


@app.get("/{full_path:path}", include_in_schema=False)
def frontend_fallback(full_path: str):
    if full_path.startswith("api/"):
        return JSONResponse(status_code=404, content={"detail": "Not Found"})
    frontend_response = _serve_frontend_file(full_path)
    if frontend_response is not None:
        return frontend_response
    return JSONResponse(status_code=404, content={"detail": "Not Found"})
