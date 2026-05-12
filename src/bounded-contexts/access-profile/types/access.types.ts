import type { LoginResponse } from '@shared/types/common.types'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  firstName: string
  lastName: string
  email: string
  password: string
  role: 'CLIENT' | 'FREELANCER'
}

export type RegisterResponse = LoginResponse

export interface SignUpResponse {
  id: string
  email: string
  roles: Array<'CLIENT' | 'FREELANCER'>
  createdAt: string
}
