import apiClient from './api.client'
import { DashboardFilters, DashboardSummary } from '../types/dashboard.types'

class DashboardService {
  async getSummary(filters: DashboardFilters = {}): Promise<DashboardSummary> {
    const response = await apiClient.get<DashboardSummary>('/dashboard/summary', {
      params: {
        start_month: filters.start_month || undefined,
        end_month: filters.end_month || undefined,
        months: filters.months?.length ? filters.months.join(',') : undefined,
        locations: filters.locations?.length ? filters.locations.join(',') : undefined,
        gender: filters.gender || undefined,
      },
    })
    return response.data
  }
}

export default new DashboardService()

