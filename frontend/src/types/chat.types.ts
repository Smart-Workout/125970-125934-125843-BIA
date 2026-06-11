import { RetrievedSnippet } from './workout.types'

export interface ChatRequest {
  message: string
  current_plan_id?: string | null
  current_plan?: unknown
}

export interface ChatResponse {
  mock_mode: boolean
  answer: string
  retrieved_snippets: RetrievedSnippet[]
  grounded: boolean
}
