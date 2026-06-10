from pydantic import BaseModel

from app.schemas.common import ChartData


class DashboardSummaryResponse(BaseModel):
    mock_mode: bool
    kpis: dict[str, int]
    workout_type_distribution: ChartData
    body_part_coverage: ChartData
    equipment_coverage: ChartData
    nutrition_macro_summary: ChartData

