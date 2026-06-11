import axios from 'axios'

const API_BASE_URL = import.meta.env.PROD ? import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000' : ''
const API_V1 = import.meta.env.VITE_API_V1 || '/api/v1'

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}${API_V1}`,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default apiClient

