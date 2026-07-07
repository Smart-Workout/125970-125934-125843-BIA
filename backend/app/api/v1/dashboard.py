from fastapi import APIRouter, Query                                        # Router groups dashboard endpoints under one API tag.

from app.services.dashboard_service import get_summary                      # Dashboard service builds KPI and chart-ready summaries.


router = APIRouter(prefix="/dashboard", tags=["dashboard"])                 # Final route path becomes /api/v1/dashboard/summary.


@router.get("/summary")
def summary(
    start_month: str | None = Query(default=None),
    end_month: str | None = Query(default=None),
    months: str | None = Query(default=None),
    location: str | None = Query(default=None),
    locations: str | None = Query(default=None),
    gender: str | None = Query(default=None),
):
    return get_summary(                                                     # Endpoint returns the current BI summary payload.
        start_month=start_month,
        end_month=end_month,
        months=months,
        location=location,
        locations=locations,
        gender=gender,
    )
