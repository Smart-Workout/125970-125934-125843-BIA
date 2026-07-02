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
  profile_cards: LifestyleProfileCard[]
  scatter_points: LifestyleScatterPoint[]
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
}

