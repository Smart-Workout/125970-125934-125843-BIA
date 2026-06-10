import { useCallback, useEffect, useState } from 'react'
import healthService from '../services/health.service'
import { HealthResponse, ReadinessHealthResponse } from '../types/health.types'

export const useHealth = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [readiness, setReadiness] = useState<ReadinessHealthResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [healthResponse, readinessResponse] = await Promise.all([
        healthService.getHealth(),
        healthService.getReadiness(),
      ])
      setHealth(healthResponse)
      setReadiness(readinessResponse)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Backend health check failed')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { health, readiness, loading, error, refresh }
}

