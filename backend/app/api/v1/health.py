from fastapi import APIRouter

from app.core.config import settings
from app.schemas.health import HealthResponse, ReadinessHealthResponse
from app.services.data_service import readiness_checks


router = APIRouter(prefix="/health", tags=["health"])


@router.get("", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service="smart-workout-api",
        version="0.1.0",
    )


@router.get("/readiness", response_model=ReadinessHealthResponse)
def readiness() -> ReadinessHealthResponse:
    checks = readiness_checks()
    status = "ok" if checks["raw_data_dir_exists"] else "warning"
    return ReadinessHealthResponse(
        status=status,
        mock_mode=settings.MOCK_MODE,
        checks=checks,
    )

