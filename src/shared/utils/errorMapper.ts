export interface NormalizedError {
  message: string
  status?: number
}

export const normalizeError = (error: unknown): NormalizedError => {
  if (error && typeof error === 'object') {
    const candidate = error as Record<string, unknown>
    const message = typeof candidate.message === 'string' ? candidate.message : 'Unexpected error'
    const status = typeof candidate.status === 'number' ? candidate.status : undefined
    return { message, status }
  }
  return { message: 'Unexpected error' }
}
