import { apiClients, http } from '@shared/api/httpClient'
import type {
  ConversationDetail,
  ConversationSummary,
  CreateConversationPayload,
  MessagesResponse,
  NotificationResponse,
  NotificationItem,
  ReportUserPayload,
  SendMessagePayload,
  SupportTicketPayload,
  ChatMessage
} from '@chat/types/chat.types'

export const chatApi = {
  createConversation: (payload: CreateConversationPayload) => http.post<ConversationDetail>(apiClients.chat, '/conversations', payload),
  getConversations: () => http.get<ConversationSummary[]>(apiClients.chat, '/conversations'),
  getConversation: (id: string) => http.get<ConversationDetail>(apiClients.chat, `/conversations/${id}`),
  getMessages: (conversationId: string, params?: { page?: number; pageSize?: number }) =>
    http.get<MessagesResponse>(apiClients.chat, `/conversations/${conversationId}/messages`, { params }),
  sendMessage: (conversationId: string, payload: SendMessagePayload) =>
    http.post<ChatMessage>(apiClients.chat, `/conversations/${conversationId}/messages`, payload),
  getNotifications: (params?: { unreadOnly?: boolean; page?: number; pageSize?: number }) =>
    http.get<NotificationResponse | NotificationItem[]>(apiClients.notifications, '/', { params }),
  markNotificationRead: (id: string) => http.patch<void>(apiClients.notifications, `/${id}/read`, {}),
  markAllNotificationsRead: () => http.patch<void>(apiClients.notifications, '/read-all', {}),
  reportUser: (payload: ReportUserPayload) => http.post<{ id: string; reportedUserId: string; status: string; createdAt: string }>(apiClients.chat, '/reports', payload),
  createSupportTicket: (payload: SupportTicketPayload) => http.post<{ id: string; status: string; createdAt: string }>(apiClients.chat, '/support-tickets', payload)
}
