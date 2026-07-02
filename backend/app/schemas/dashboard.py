from pydantic import BaseModel

from app.schemas.common import ChartData


class RelationalLocationRow(BaseModel):
    gym_id: str
    location: str
    gym_type: str
    session_count: int
    unique_users: int
    avg_duration_minutes: float


class RelationalMembershipSection(BaseModel):
    kpis: dict[str, float | int]
    monthly_activity: ChartData
    subscription_mix: ChartData
    gym_type_session_mix: ChartData
    workout_avg_calories: ChartData
    top_locations: list[RelationalLocationRow]


class LifestyleProfileCard(BaseModel):
    cluster_id: int
    label: str
    readiness_score: float
    sleep_duration: float
    physical_activity_level: float
    stress_level: float
    record_count: int


class LifestyleScatterPoint(BaseModel):
    cluster_id: int
    sleep_duration: float
    physical_activity_level: float
    stress_level: float
    readiness_score: float


class LifestyleProfilesSection(BaseModel):
    silhouette_scores: ChartData
    sleep_duration_by_cluster: ChartData
    quality_of_sleep_by_cluster: ChartData
    activity_by_cluster: ChartData
    stress_by_cluster: ChartData
    daily_steps_by_cluster: ChartData
    profile_cards: list[LifestyleProfileCard]
    scatter_points: list[LifestyleScatterPoint]


class DashboardSummaryResponse(BaseModel):
    mock_mode: bool
    kpis: dict[str, int]
    workout_type_distribution: ChartData
    body_part_coverage: ChartData
    equipment_coverage: ChartData
    nutrition_macro_summary: ChartData
    relational_membership: RelationalMembershipSection
    lifestyle_profiles: LifestyleProfilesSection

