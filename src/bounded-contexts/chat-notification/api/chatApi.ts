import { apiClients, http } from '@shared/api/httpClient'

export const chatApi = {
  createConversation: (payload: { participantId: string; projectId?: string }) =>
    http.post<{ id: string }>(apiClients.chat, '/conversations', payload)
}
