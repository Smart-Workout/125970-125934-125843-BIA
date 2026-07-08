import { useState } from 'react'
import chatService from '../services/chat.service'
import { toUserErrorMessage } from '../utils/apiError'
import { ChatResponse } from '../types/chat.types'
import { GeneratedPlanResponse } from '../types/workout.types'

export interface ChatMessage {
  role: 'user' | 'assistant'
  text: string
}

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [lastResponse, setLastResponse] = useState<ChatResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const send = async (message: string, plan?: GeneratedPlanResponse | null) => {
    if (!message.trim()) return
    try {
      setLoading(true)
      setError(null)
      setMessages((current) => [...current, { role: 'user', text: message }])
      const response = await chatService.sendMessage({
        message,
        current_plan_id: plan?.plan_id ?? null,
        current_plan: plan ?? {},
      })
      setLastResponse(response)
      setMessages((current) => [...current, { role: 'assistant', text: response.answer }])
    } catch (err) {
      setError(toUserErrorMessage(err, 'Chat request failed'))
    } finally {
      setLoading(false)
    }
  }

  return { messages, lastResponse, loading, error, send }
}

