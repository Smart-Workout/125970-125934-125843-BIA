from fastapi import APIRouter                                               # Router groups dashboard endpoints under one API tag.

from app.services.dashboard_service import get_summary                      # Dashboard service builds KPI and chart-ready summaries.


router = APIRouter(prefix="/dashboard", tags=["dashboard"])                 # Final route path becomes /api/v1/dashboard/summary.


@router.get("/summary")
def summary():
    return get_summary()                                                    # Endpoint returns the current BI summary payload.
