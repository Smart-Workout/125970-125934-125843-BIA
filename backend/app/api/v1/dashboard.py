from fastapi import APIRouter

from app.schemas.dashboard import DashboardSummaryResponse
from app.services.dashboard_service import get_summary


router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummaryResponse)
def summary() -> DashboardSummaryResponse:
    return get_summary()

