import axios from 'axios'

const API_BASE_URL = import.meta.env.PROD ? import.meta.env.VITE_API_URL || '' : ''
const API_V1 = import.meta.env.VITE_API_V1 || '/api/v1'

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}${API_V1}`,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default apiClient

