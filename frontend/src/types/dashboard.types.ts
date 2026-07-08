export interface ChartData {
  labels: string[]
  values: number[]
}

export interface RelationalLocationRow {
  gym_id: string
  location: string
  gym_type: string
  session_count: number
  unique_users: number
  avg_duration_minutes: number
}

export interface SubscriptionPlanRow {
  subscription_plan: string
  tier: 'basic' | 'advanced'
  user_count: number
  price_per_month: number
  estimated_monthly_recurring_revenue: number
}

export interface SubscriptionTierDashboard {
  tier: 'basic' | 'advanced'
  title: string
  included_subscriptions: string[]
  member_count: number
  member_share: number
  sampled_sessions: number
  session_share: number
  estimated_monthly_recurring_revenue: number
  avg_checkins_per_member: number
  avg_duration_minutes: number
  avg_calories_per_session: number
  top_workout_type: string
  membership_note: string
  monthly_activity: ChartData
  workout_mix: ChartData
  top_locations: RelationalLocationRow[]
}

export interface RelationalMembershipSection {
  kpis: {
    active_members: number
    avg_checkins_per_member: number
    subscription_plans: number
    gym_locations: number
  }
  monthly_activity: ChartData
  subscription_mix: ChartData
  gym_type_session_mix: ChartData
  workout_avg_calories: ChartData
  top_locations: RelationalLocationRow[]
  plan_breakdown: SubscriptionPlanRow[]
  tier_dashboards: SubscriptionTierDashboard[]
}

export interface LifestyleProfileCard {
  cluster_id: number
  label: string
  readiness_score: number
  sleep_duration: number
  physical_activity_level: number
  stress_level: number
  record_count: number
}

export interface LifestyleScatterPoint {
  cluster_id: number
  sleep_duration: number
  physical_activity_level: number
  stress_level: number
  readiness_score: number
}

export interface LifestyleProfilesSection {
  silhouette_scores: ChartData
  sleep_duration_by_cluster: ChartData
  quality_of_sleep_by_cluster: ChartData
  activity_by_cluster: ChartData
  stress_by_cluster: ChartData
  daily_steps_by_cluster: ChartData
  radar_metrics: RadarMetric[]
  profile_cards: LifestyleProfileCard[]
  scatter_points: LifestyleScatterPoint[]
}

export interface DashboardFilters {
  start_month?: string
  end_month?: string
  months?: string[]
  locations?: string[]
  gender?: string
}

export interface DashboardFilterOptions {
  months: string[]
  locations: string[]
  genders: string[]
}

export interface ExecutiveSummarySection {
  kpis: {
    selected_sessions: number
    selected_users: number
    avg_duration_minutes: number
    avg_calories: number
  }
  monthly_activity: ChartData
  gender_mix: ChartData
  location_mix: ChartData
  workout_mix: ChartData
  usage_heatmap: UsageHeatmapCell[]
  calendar_heatmap: CalendarHeatmapDay[]
  calorie_distribution: DistributionSummary
  duration_distribution: DistributionSummary
  journey_sankey: SankeyGraph
  engagement_scatter: EngagementScatterPoint[]
}

export interface UserInfoRow {
  user_id: string
  age: number
  gender: string
  user_location: string
  subscription_plan: string
  age_group: string
  session_count: number
  avg_duration_minutes: number
  avg_calories: number
}

export interface UserInfoSection {
  kpis: {
    unique_users: number
    avg_age: number
    avg_sessions_per_user: number
    subscription_types: number
  }
  gender_mix: ChartData
  age_group_mix: ChartData
  subscription_mix: ChartData
  top_user_locations: ChartData
  sample_users: UserInfoRow[]
}

export interface NutritionFoodItem {
  food_item: string
  meal_type: string
  category: string
  calories: number
  protein_g: number
  carbohydrates_g: number
  fat_g: number
}

export interface NutritionPlanSection {
  kpis: {
    food_items: number
    avg_calories: number
    avg_protein_g: number
    avg_water_ml: number
  }
  macro_mix: ChartData
  meal_calories: ChartData
  meal_protein: ChartData
  top_protein_foods: NutritionFoodItem[]
}

export interface ExercisePlanDashboardSection {
  kpis: {
    selected_sessions: number
    workout_types: number
    avg_calories: number
    avg_duration_minutes: number
  }
  workout_mix: ChartData
  calories_by_workout: ChartData
  duration_by_workout: ChartData
  body_part_coverage: ChartData
  equipment_coverage: ChartData
  shap_summary: ModelFeatureImpact[]
}

export interface UsageHeatmapCell {
  weekday: string
  hour: number
  session_count: number
}

export interface CalendarHeatmapDay {
  date: string
  month: string
  weekday: string
  session_count: number
}

export interface DistributionSummary {
  metric: string
  unit: string
  min_value: number
  q1: number
  median: number
  q3: number
  max_value: number
  outlier_count: number
  histogram: ChartData
}

export interface EngagementScatterPoint {
  user_id: string
  workout_type: string
  gender: string
  duration_minutes: number
  calories_burned: number
  session_count: number
}

export interface ModelFeatureImpact {
  feature: string
  impact: number
  direction: string
  explanation: string
}

export interface SourceGraphNode {
  id: string
  label: string
  group: string
}

export interface SourceGraphEdge {
  source: string
  target: string
  label: string
}

export interface SourceGraph {
  title: string
  nodes: SourceGraphNode[]
  edges: SourceGraphEdge[]
}

export interface SankeyNode {
  id: string
  label: string
  group: string
}

export interface SankeyLink {
  source: string
  target: string
  value: number
  label: string
}

export interface SankeyGraph {
  nodes: SankeyNode[]
  links: SankeyLink[]
}

export interface RadarMetric {
  cluster_id: number
  label: string
  sleep_score: number
  activity_score: number
  stress_score: number
  readiness_score: number
  recovery_score: number
}

export interface DashboardWorkspaceSection {
  filter_options: DashboardFilterOptions
  executive_summary: ExecutiveSummarySection
  user_info: UserInfoSection
  nutrition_plan: NutritionPlanSection
  exercise_plan: ExercisePlanDashboardSection
  source_graphs: {
    readiness: SourceGraph
    intensity: SourceGraph
  }
}

export interface DashboardSummary {
  mock_mode: boolean
  kpis: {
    exercise_count: number
    gym_rows: number
    sleep_rows: number
    nutrition_rows: number
    raw_dataset_count: number
  }
  workout_type_distribution: ChartData
  body_part_coverage: ChartData
  equipment_coverage: ChartData
  nutrition_macro_summary: ChartData
  relational_membership: RelationalMembershipSection
  lifestyle_profiles: LifestyleProfilesSection
  dashboard_workspace: DashboardWorkspaceSection
}

