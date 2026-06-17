from fastapi import APIRouter                                               # Router groups health and readiness endpoints.

from app.services.data_service import readiness_checks                      # Service checks required data files and folders.


router = APIRouter(prefix="/health", tags=["health"])                       # Final route path becomes /api/v1/health.


@router.get("")
def health() -> dict[str, str]:
    return {"status": "ok"}                                                 # Lightweight heartbeat confirms the API process is alive.


@router.get("/readiness")
def readiness() -> dict[str, object]:
    checks = readiness_checks()                                             # Readiness validates project data availability.
    return {
        "status": "ok" if all(checks.values()) else "degraded",             # Overall status becomes degraded when any required check fails.
        "checks": checks,                                                   # Detailed checks make missing assets easier to diagnose.
    }
