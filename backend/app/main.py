import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.chat import router as chat_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.health import router as health_router
from app.api.v1.workout import router as workout_router
from app.core.config import settings
from app.core.logging import setup_logging


setup_logging()
logger = logging.getLogger("app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting %s", settings.APP_NAME)
    logger.info("Environment: %s", settings.APP_ENV)
    logger.info("Mock mode: %s", settings.MOCK_MODE)
    logger.info("Raw data dir: %s", settings.RAW_DATA_DIR)
    logger.info("Model dir: %s", settings.MODEL_DIR)
    yield
    logger.info("Shutting down %s", settings.APP_NAME)


app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    description=(
        "Backend API for personalized workout preprocessing, prediction, "
        "exercise recommendation, plan generation, dashboard analytics, and chat."
    ),
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router, prefix=settings.API_V1_STR)
app.include_router(workout_router, prefix=settings.API_V1_STR)
app.include_router(chat_router, prefix=settings.API_V1_STR)


@app.get("/")
def root() -> dict[str, str | bool]:
    return {
        "message": "Smart Workout DSS/BIS API is running",
        "mock_mode": settings.MOCK_MODE,
    }

