export interface HealthResponse {
  status: string
  service: string
  version: string
}

export interface ReadinessHealthResponse {
  status: string
  mock_mode: boolean
  checks: Record<string, boolean>
}

