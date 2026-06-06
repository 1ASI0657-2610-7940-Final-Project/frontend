import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { useAuthStore } from '../../app/stores/authStore'
import type { ErrorResponse } from '../types/common.types'

const ApiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api'
const accessBase = `${ApiBaseUrl}/access`
const profileBase = `${ApiBaseUrl}/profile`
const marketplaceBase = `${ApiBaseUrl}/marketplace`
const pullsBase = `${ApiBaseUrl}/engagement`
const chatApiBase = `${ApiBaseUrl}/chat`
const chatNotificationsBase = `${ApiBaseUrl}/notifications`

const createClient = (baseURL: string): AxiosInstance => {
  const client = axios.create({ baseURL, timeout: 15000 })

  client.interceptors.request.use((config) => {
    const auth = useAuthStore()
    if (auth.token) config.headers.Authorization = `Bearer ${auth.token}`
    return config
  })

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const data = (error.response?.data ?? {}) as Partial<ErrorResponse>
      const normalized: ErrorResponse = {
        timestamp: data.timestamp,
        status: error.response?.status ?? 500,
        error: data.error ?? 'REQUEST_FAILED',
        message: data.message ?? 'Request failed.',
        path: data.path,
        fields: data.fields ?? {}
      }

      const requestPath = error.config?.url ?? ''
      const isAccessLoginFlow = requestPath.includes('/login') || requestPath.includes('/sign-up')
      if (normalized.status === 401 && !isAccessLoginFlow) {
        const auth = useAuthStore()
        if (auth.token) {
          auth.clearSession()
          window.location.href = '/login'
        }
      }

      return Promise.reject(normalized)
    }
  )

  return client
}

export const apiClients = {
  access: createClient(accessBase),
  profile: createClient(profileBase),
  marketplace: createClient(marketplaceBase),
  engagement: createClient(pullsBase),
  chat: createClient(chatApiBase),
  notifications: createClient(chatNotificationsBase)
}

const request = async <T>(client: AxiosInstance, config: AxiosRequestConfig): Promise<T> => {
  const { data } = await client.request<T>(config)
  return data
}

export const http = {
  get: <T>(client: AxiosInstance, url: string, config?: AxiosRequestConfig) => request<T>(client, { ...config, method: 'GET', url }),
  post: <T>(client: AxiosInstance, url: string, body?: unknown, config?: AxiosRequestConfig) =>
    request<T>(client, { ...config, method: 'POST', url, data: body }),
  patch: <T>(client: AxiosInstance, url: string, body?: unknown, config?: AxiosRequestConfig) =>
    request<T>(client, { ...config, method: 'PATCH', url, data: body }),
  delete: <T>(client: AxiosInstance, url: string, config?: AxiosRequestConfig) => request<T>(client, { ...config, method: 'DELETE', url }),
  upload: <T>(client: AxiosInstance, url: string, formData: FormData, config?: AxiosRequestConfig) =>
    request<T>(client, {
      ...config,
      method: 'POST',
      url,
      data: formData,
      headers: { ...(config?.headers ?? {}), 'Content-Type': 'multipart/form-data' }
    })
}
