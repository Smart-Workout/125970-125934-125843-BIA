import { useCallback, useEffect, useState } from 'react'
import dashboardService from '../services/dashboard.service'
import { DashboardFilters, DashboardSummary } from '../types/dashboard.types'

export const useDashboard = (filters: DashboardFilters = {}) => {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const filterKey = JSON.stringify(filters)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const summary = await dashboardService.getSummary(filters)
      setData(summary)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard summary')
    } finally {
      setLoading(false)
    }
  }, [filterKey])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { data, loading, error, refresh }
}

