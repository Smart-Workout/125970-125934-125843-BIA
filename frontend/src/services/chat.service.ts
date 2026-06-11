import apiClient from './api.client'
import { ChatRequest, ChatResponse } from '../types/chat.types'

class ChatService {
  async sendMessage(payload: ChatRequest): Promise<ChatResponse> {
    const response = await apiClient.post<ChatResponse>('/chat', payload)
    return response.data
  }
}

export default new ChatService()

