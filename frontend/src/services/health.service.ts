import apiClient from './api.client'
import { HealthResponse, ReadinessHealthResponse } from '../types/health.types'

class HealthService {
  async getHealth(): Promise<HealthResponse> {
    const response = await apiClient.get<HealthResponse>('/health')
    return response.data
  }

  async getReadiness(): Promise<ReadinessHealthResponse> {
    const response = await apiClient.get<ReadinessHealthResponse>('/health/readiness')
    return response.data
  }
}

export default new HealthService()

