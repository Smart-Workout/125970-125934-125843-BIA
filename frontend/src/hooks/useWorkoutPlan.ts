import { useState } from 'react'
import workoutService from '../services/workout.service'
import { UserProfileRequest, WorkoutFlowResult } from '../types/workout.types'

export const useWorkoutPlan = () => {
  const [data, setData] = useState<WorkoutFlowResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (profile: UserProfileRequest) => {
    try {
      setLoading(true)
      setError(null)
      const [preprocess, calories, intensity, exercises] = await Promise.all([
        workoutService.preprocess(profile),
        workoutService.predictCalories(profile),
        workoutService.predictIntensity(profile),
        workoutService.recommendExercises(profile),
      ])
      const plan = await workoutService.generatePlan({
        profile,
        predicted_intensity: intensity.predicted_class,
        readiness_band: preprocess.readiness.band,
        recommended_exercise_ids: exercises.recommendations.map((item) => item.exercise_id),
      })
      setData({ preprocess, calories, intensity, exercises, plan })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate workout plan')
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, submit }
}

