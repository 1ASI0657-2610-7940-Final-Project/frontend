export interface ConversationParticipant {
  id: string
  displayName: string
  role?: string
  avatarUrl?: string
}

export interface ConversationSummary {
  id: string
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
  participants: ConversationParticipant[]
  projectId?: string
}

export interface ConversationDetail {
  id: string
  participants: ConversationParticipant[]
  projectId?: string
  createdAt: string
}

export interface CreateConversationPayload {
  participantId: string
  projectId?: string
}

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  content: string
  sentAt: string
}

export interface ChatMessageCreatedEvent {
  eventType: string
  messageId: string
  conversationId: string
  senderId: string
  receiverId?: string | null
  content: string
  contentPreview: string
  occurredAt: string
  metadata: Record<string, string>
}

export interface MessagesResponse {
  data: ChatMessage[]
  page: number
  pageSize: number
  total: number
}

export interface SendMessagePayload {
  content: string
}

export interface NotificationItem {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
  resourceType?: string
  resourceId?: string
}

export interface NotificationRealtimeEvent {
  eventType: string
  notificationId: string
  recipientId: string
  type: string
  title: string
  message: string
  resourceType?: string | null
  resourceId?: string | null
  read: boolean
  createdAt: string
}

export interface NotificationResponse {
  data: NotificationItem[]
  page: number
  pageSize: number
  total: number
}

export interface ReportUserPayload {
  reportedUserId: string
  reason: string
  description: string
}

export interface SupportTicketPayload {
  subject: string
  description: string
}
