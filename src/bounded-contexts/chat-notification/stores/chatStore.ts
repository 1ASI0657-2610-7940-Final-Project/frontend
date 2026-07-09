import { defineStore } from 'pinia'
import { ref } from 'vue'
import { chatApi } from '@chat/api/chatApi'
import { chatRealtimeClient } from '@chat/services/chatRealtime'
import { normalizeError } from '@shared/utils/errorMapper'
import type { ChatMessage, ChatMessageCreatedEvent, ConversationDetail, ConversationSummary, CreateConversationPayload } from '@chat/types/chat.types'
import { useAuthStore } from '../../../app/stores/authStore'

export const useChatStore = defineStore('chat', () => {
  const authStore = useAuthStore()
  const conversations = ref<ConversationSummary[]>([])
  const selectedConversation = ref<ConversationDetail | null>(null)
  const messages = ref<ChatMessage[]>([])
  const activeConversationId = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const sortBySentAtAsc = (list: ChatMessage[]) => {
    return [...list].sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime())
  }

  const upsertMessage = (message: ChatMessage) => {
    if (messages.value.some((item) => item.id === message.id)) {
      return
    }
    messages.value = sortBySentAtAsc([...messages.value, message])
  }

  const updateConversationPreview = (event: ChatMessageCreatedEvent) => {
    conversations.value = conversations.value.map((conversation) => {
      if (conversation.id !== event.conversationId) {
        return conversation
      }

      const isActiveConversation = selectedConversation.value?.id === event.conversationId
      return {
        ...conversation,
        lastMessage: event.contentPreview || event.content,
        lastMessageAt: event.occurredAt,
        unreadCount: isActiveConversation ? 0 : (conversation.unreadCount ?? 0) + 1
      }
    })
  }

  const handleRealtimeMessage = (event: ChatMessageCreatedEvent) => {
    upsertMessage({
      id: event.messageId,
      conversationId: event.conversationId,
      senderId: event.senderId,
      content: event.content,
      sentAt: event.occurredAt
    })
    updateConversationPreview(event)
  }

  const connectRealtime = () => {
    chatRealtimeClient.configure(() => authStore.token, handleRealtimeMessage)
    chatRealtimeClient.connect()
    if (activeConversationId.value) {
      chatRealtimeClient.subscribeConversation(activeConversationId.value)
    }
  }

  const fetchConversations = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await chatApi.getConversations()
      conversations.value = Array.isArray(res) ? res : []
    } catch (e) {
      console.warn('[chat] failed to load conversations', e)
      error.value = normalizeError(e).message
      conversations.value = []
    } finally {
      loading.value = false
    }
  }

  const createConversation = async (payload: CreateConversationPayload) => chatApi.createConversation(payload)

  const fetchConversation = async (id: string) => {
    try {
      selectedConversation.value = await chatApi.getConversation(id)
    } catch (e) {
      console.error('[chat] failed to load conversation detail', { conversationId: id, error: e })
      throw e
    }
  }

  const fetchMessages = async (id: string, params?: { page?: number; pageSize?: number }) => {
    try {
      const response = await chatApi.getMessages(id, params)
      messages.value = sortBySentAtAsc(response.data ?? [])
    } catch (e) {
      console.error('[chat] failed to load messages', { conversationId: id, params, error: e })
      throw e
    }
  }

  const selectConversation = async (id: string) => {
    loading.value = true
    try {
      await Promise.all([fetchConversation(id), fetchMessages(id, { page: 1, pageSize: 30 })])
      activeConversationId.value = id
      connectRealtime()
    } catch (e) {
      console.error('[chat] failed to select conversation', { conversationId: id, error: e })
      error.value = normalizeError(e).message
    } finally {
      loading.value = false
    }
  }

  const sendMessage = async (id: string, payload: { content: string }) => {
    try {
      const sent = await chatApi.sendMessage(id, payload)
      upsertMessage(sent)
      return sent
    } catch (e) {
      console.error('[chat] failed to send message', { conversationId: id, error: e })
      throw e
    }
  }

  const disconnectRealtime = () => {
    activeConversationId.value = null
    chatRealtimeClient.disconnect()
  }

  return {
    conversations,
    selectedConversation,
    messages,
    activeConversationId,
    loading,
    error,
    fetchConversations,
    createConversation,
    selectConversation,
    fetchConversation,
    fetchMessages,
    sendMessage,
    connectRealtime,
    disconnectRealtime
  }
})
