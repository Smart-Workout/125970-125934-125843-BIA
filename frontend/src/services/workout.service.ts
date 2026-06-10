import apiClient from './api.client'
import {
  CaloriePredictionResponse,
  ExerciseRecommendationResponse,
  GeneratedPlanResponse,
  GeneratePlanRequest,
  IntensityPredictionResponse,
  PreprocessResponse,
  UserProfileRequest,
} from '../types/workout.types'

class WorkoutService {
  async preprocess(payload: UserProfileRequest): Promise<PreprocessResponse> {
    const response = await apiClient.post<PreprocessResponse>('/workout/preprocess', payload)
    return response.data
  }

  async predictCalories(payload: UserProfileRequest): Promise<CaloriePredictionResponse> {
    const response = await apiClient.post<CaloriePredictionResponse>('/workout/predict-calories', payload)
    return response.data
  }

  async predictIntensity(payload: UserProfileRequest): Promise<IntensityPredictionResponse> {
    const response = await apiClient.post<IntensityPredictionResponse>('/workout/predict-intensity', payload)
    return response.data
  }

  async recommendExercises(payload: UserProfileRequest): Promise<ExerciseRecommendationResponse> {
    const response = await apiClient.post<ExerciseRecommendationResponse>('/workout/recommend-exercises', payload)
    return response.data
  }

  async generatePlan(payload: GeneratePlanRequest): Promise<GeneratedPlanResponse> {
    const response = await apiClient.post<GeneratedPlanResponse>('/workout/generate-plan', payload)
    return response.data
  }
}

export default new WorkoutService()

