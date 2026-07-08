import axios from 'axios'

interface ApiErrorPayload {
  detail?: string
  message?: string
}

export function toUserErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    const status = error.response?.status
    const detail = error.response?.data?.detail

    if (status === 504) {
      return 'Request took too long. Please retry in a moment.'
    }

    if (typeof detail === 'string' && detail.trim()) {
      return detail
    }

    if (typeof error.response?.data?.message === 'string' && error.response.data.message.trim()) {
      return error.response.data.message
    }

    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. Please retry.'
    }

    if (typeof error.message === 'string' && error.message.trim()) {
      return error.message
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return fallback
}
