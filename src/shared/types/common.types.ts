export type UserRole = 'CLIENT' | 'FREELANCER'

export interface User {
  id: string
  firstName?: string
  lastName?: string
  email: string
  role?: UserRole
  roles?: UserRole[]
  avatarUrl?: string
}

export interface LoginResponse {
  accessToken: string
  tokenType?: string
  expiresIn?: number
  user: User
}

export interface ErrorResponse {
  timestamp?: string
  status: number
  error: string
  message: string
  path?: string
  fields?: Record<string, string>
}

export interface PaginatedResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
