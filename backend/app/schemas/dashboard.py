from pydantic import BaseModel

from app.schemas.common import ChartData


class RelationalLocationRow(BaseModel):
    gym_id: str
    location: str
    gym_type: str
    session_count: int
    unique_users: int
    avg_duration_minutes: float


class SubscriptionPlanRow(BaseModel):
    subscription_plan: str
    tier: str
    user_count: int
    price_per_month: float
    estimated_monthly_recurring_revenue: float


class SubscriptionTierDashboard(BaseModel):
    tier: str
    title: str
    included_subscriptions: list[str]
    member_count: int
    member_share: float
    sampled_sessions: int
    session_share: float
    estimated_monthly_recurring_revenue: float
    avg_checkins_per_member: float
    avg_duration_minutes: float
    avg_calories_per_session: float
    top_workout_type: str
    membership_note: str
    monthly_activity: ChartData
    workout_mix: ChartData
    top_locations: list[RelationalLocationRow]


class RelationalMembershipSection(BaseModel):
    kpis: dict[str, float | int]
    monthly_activity: ChartData
    subscription_mix: ChartData
    gym_type_session_mix: ChartData
    workout_avg_calories: ChartData
    top_locations: list[RelationalLocationRow]
    plan_breakdown: list[SubscriptionPlanRow]
    tier_dashboards: list[SubscriptionTierDashboard]


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
    activity_by_cluster: ChartData
    stress_by_cluster: ChartData
    profile_cards: list[LifestyleProfileCard]
    scatter_points: list[LifestyleScatterPoint]


class DashboardFilterOptions(BaseModel):
    months: list[str]
    locations: list[str]
    genders: list[str]


class ExecutiveSummarySection(BaseModel):
    kpis: dict[str, float | int]
    monthly_activity: ChartData
    gender_mix: ChartData
    location_mix: ChartData
    workout_mix: ChartData
    usage_heatmap: list["UsageHeatmapCell"]
    engagement_scatter: list["EngagementScatterPoint"]


class UserInfoRow(BaseModel):
    user_id: str
    age: int
    gender: str
    user_location: str
    subscription_plan: str
    age_group: str
    session_count: int
    avg_duration_minutes: float
    avg_calories: float


class UserInfoSection(BaseModel):
    kpis: dict[str, float | int]
    gender_mix: ChartData
    age_group_mix: ChartData
    subscription_mix: ChartData
    top_user_locations: ChartData
    sample_users: list[UserInfoRow]


class NutritionFoodItem(BaseModel):
    food_item: str
    meal_type: str
    category: str
    calories: float
    protein_g: float
    carbohydrates_g: float
    fat_g: float


class NutritionPlanSection(BaseModel):
    kpis: dict[str, float | int]
    macro_mix: ChartData
    meal_calories: ChartData
    meal_protein: ChartData
    top_protein_foods: list[NutritionFoodItem]


class ExercisePlanDashboardSection(BaseModel):
    kpis: dict[str, float | int]
    workout_mix: ChartData
    calories_by_workout: ChartData
    duration_by_workout: ChartData
    body_part_coverage: ChartData
    equipment_coverage: ChartData
    shap_summary: list["ModelFeatureImpact"]


class SourceGraphNode(BaseModel):
    id: str
    label: str
    group: str


class SourceGraphEdge(BaseModel):
    source: str
    target: str
    label: str


class SourceGraph(BaseModel):
    title: str
    nodes: list[SourceGraphNode]
    edges: list[SourceGraphEdge]


class UsageHeatmapCell(BaseModel):
    weekday: str
    hour: int
    session_count: int


class EngagementScatterPoint(BaseModel):
    user_id: str
    workout_type: str
    gender: str
    duration_minutes: float
    calories_burned: float
    session_count: int


class ModelFeatureImpact(BaseModel):
    feature: str
    impact: float
    direction: str
    explanation: str


class DashboardWorkspaceSection(BaseModel):
    filter_options: DashboardFilterOptions
    executive_summary: ExecutiveSummarySection
    user_info: UserInfoSection
    nutrition_plan: NutritionPlanSection
    exercise_plan: ExercisePlanDashboardSection
    source_graphs: dict[str, SourceGraph]


class DashboardSummaryResponse(BaseModel):
    mock_mode: bool
    kpis: dict[str, int]
    workout_type_distribution: ChartData
    body_part_coverage: ChartData
    equipment_coverage: ChartData
    nutrition_macro_summary: ChartData
    relational_membership: RelationalMembershipSection
    lifestyle_profiles: LifestyleProfilesSection
    dashboard_workspace: DashboardWorkspaceSection

