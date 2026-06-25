import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'

type ApiKey = 'access' | 'marketplace' | 'pulls' | 'chat' | 'notifications'

const apiBaseUrls: Record<ApiKey, string> = {
  access: import.meta.env.VITE_ACCESS_PROFILE_SERVICE_URL || '/api/access',
  marketplace: import.meta.env.VITE_GIG_MARKETPLACE_SERVICE_URL || '/api/marketplace',
  pulls: import.meta.env.VITE_PULLS_SERVICE_URL || '/api/engagement',
  chat: import.meta.env.VITE_CHAT_SERVICE_URL || '/api/chat',
  notifications: import.meta.env.VITE_CHAT_SERVICE_URL || '/api/chat'
}

const normalizeBaseUrl = (url: string) => url.replace(/\/$/, '')

const clients: Partial<Record<ApiKey, AxiosInstance>> = {}

const getClient = (key: ApiKey) => {
  if (!clients[key]) {
    clients[key] = axios.create({ baseURL: normalizeBaseUrl(apiBaseUrls[key]), headers: { 'Content-Type': 'application/json' } })
  }
  return clients[key]!
}

const request = async <T>(client: AxiosInstance, config: AxiosRequestConfig): Promise<T> => {
  const response: AxiosResponse<T> = await client.request<T>(config)
  return response.data
}

export const apiClients = {
  access: getClient('access'),
  marketplace: getClient('marketplace'),
  pulls: getClient('pulls'),
  chat: getClient('chat'),
  notifications: getClient('notifications')
}

export const http = {
  get: async <T>(client: AxiosInstance, url: string, config: AxiosRequestConfig = {}) => request<T>(client, { ...config, url, method: 'GET' }),
  post: async <T>(client: AxiosInstance, url: string, data?: unknown, config: AxiosRequestConfig = {}) => request<T>(client, { ...config, url, data, method: 'POST' }),
  patch: async <T>(client: AxiosInstance, url: string, data?: unknown, config: AxiosRequestConfig = {}) => request<T>(client, { ...config, url, data, method: 'PATCH' }),
  delete: async <T>(client: AxiosInstance, url: string, config: AxiosRequestConfig = {}) => request<T>(client, { ...config, url, method: 'DELETE' }),
  upload: async <T>(client: AxiosInstance, url: string, formData: FormData, config: AxiosRequestConfig = {}) =>
    request<T>(client, {
      ...config,
      url,
      data: formData,
      method: 'POST',
      headers: {
        ...(config.headers || {}),
        'Content-Type': 'multipart/form-data'
      }
    })
}
