export type BodyPart = 'chest' | 'back' | 'legs' | 'arms' | 'shoulders' | 'core' | 'waist' | 'full body'
export type Goal = 'strength' | 'muscle gain' | 'fat loss' | 'general fitness'
export type IntensityBand = 'Low' | 'Medium' | 'High'

export interface UserProfileRequest {
  age: number
  height_cm: number
  weight_kg: number
  sleep_hours: number
  stress_level: number
  blood_pressure: string
  resting_heart_rate: number
  target_body_part: BodyPart
  available_equipment: string[]
  sessions_per_week: number
  goal: Goal
}

export interface ProcessedProfile {
  age: number
  height_cm: number
  weight_kg: number
  bmi: number
  bmi_category: string
  sleep_hours: number
  stress_level: number
  systolic_bp: number
  diastolic_bp: number
  resting_heart_rate: number
  target_body_part: string
  available_equipment: string[]
  sessions_per_week: number
  goal: string
}

export interface ReadinessResult {
  band: IntensityBand
  score: number
  factors: string[]
}

export interface PreprocessResponse {
  mock_mode: boolean
  processed_profile: ProcessedProfile
  readiness: ReadinessResult
}

export interface CaloriePredictionResponse {
  mock_mode: boolean
  prediction: number
  unit: string
  model_name: string
  confidence_note: string
  input_summary: Record<string, string | number>
}

export interface IntensityPredictionResponse {
  mock_mode: boolean
  predicted_class: IntensityBand
  class_probabilities: Record<IntensityBand, number>
  model_name: string
  readiness_band: IntensityBand
  explanation: string[]
}

export interface ExerciseRecommendation {
  exercise_id: string
  name: string
  body_parts: string[]
  target_muscles: string[]
  equipment: string[]
  match_score: number
  instructions: string[]
}

export interface ExerciseRecommendationResponse {
  mock_mode: boolean
  target_body_part: string
  available_equipment: string[]
  recommendations: ExerciseRecommendation[]
  fallback_used: boolean
}

export interface GeneratePlanRequest {
  profile: UserProfileRequest
  predicted_intensity: IntensityBand
  readiness_band?: IntensityBand
  recommended_exercise_ids?: string[]
}

export interface RetrievedSnippet {
  source: string
  category: string
  text: string
}

export interface PlanExercise {
  exercise_id: string
  name: string
  sets: number
  reps: string
  rest_seconds: number
}

export interface PlanDay {
  day: string
  focus: string
  exercises: PlanExercise[]
}

export interface GeneratedPlanResponse {
  mock_mode: boolean
  plan_id: string
  plan_type: string
  readiness_band: IntensityBand
  predicted_intensity: IntensityBand
  weekly_schedule: PlanDay[]
  safety_notes: string[]
  rag_snippets: RetrievedSnippet[]
}

export interface WorkoutFlowResult {
  preprocess: PreprocessResponse
  calories: CaloriePredictionResponse
  intensity: IntensityPredictionResponse
  exercises: ExerciseRecommendationResponse
  plan: GeneratedPlanResponse
}

