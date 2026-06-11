export interface ChartData {
  labels: string[]
  values: number[]
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
}

