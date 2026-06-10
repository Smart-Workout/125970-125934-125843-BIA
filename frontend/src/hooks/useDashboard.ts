import { useCallback, useEffect, useState } from 'react'
import dashboardService from '../services/dashboard.service'
import { DashboardSummary } from '../types/dashboard.types'

export const useDashboard = () => {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const summary = await dashboardService.getSummary()
      setData(summary)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard summary')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { data, loading, error, refresh }
}

