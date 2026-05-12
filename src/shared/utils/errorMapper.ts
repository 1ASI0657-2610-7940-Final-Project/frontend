import type { ErrorResponse } from '../types/common.types'

export const normalizeError = (error: unknown): ErrorResponse => {
  if (typeof error === 'object' && error !== null && 'status' in error && 'message' in error) {
    return error as ErrorResponse
  }
  return { status: 500, error: 'UNKNOWN_ERROR', message: 'An unexpected error occurred.' }
}
