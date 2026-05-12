import { defineStore } from 'pinia'
import { ref } from 'vue'
import { chatApi } from '@chat/api/chatApi'
import { normalizeError } from '@shared/utils/errorMapper'
import type { ChatMessage, ConversationDetail, ConversationSummary, CreateConversationPayload } from '@chat/types/chat.types'

export const useChatStore = defineStore('chat', () => {
  const conversations = ref<ConversationSummary[]>([])
  const selectedConversation = ref<ConversationDetail | null>(null)
  const messages = ref<ChatMessage[]>([])
  const pollingTimer = ref<number | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const sortBySentAtAsc = (list: ChatMessage[]) => {
    return [...list].sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime())
  }

  const fetchConversations = async () => {
    loading.value = true
    error.value = null
    try {
      conversations.value = await chatApi.getConversations()
    } catch (e) {
      error.value = normalizeError(e).message
    } finally {
      loading.value = false
    }
  }

  const createConversation = async (payload: CreateConversationPayload) => chatApi.createConversation(payload)

  const fetchConversation = async (id: string) => {
    selectedConversation.value = await chatApi.getConversation(id)
  }

  const fetchMessages = async (id: string, params?: { page?: number; pageSize?: number }) => {
    const response = await chatApi.getMessages(id, params)
    messages.value = sortBySentAtAsc(response.data ?? [])
  }

  const selectConversation = async (id: string) => {
    loading.value = true
    try {
      await Promise.all([fetchConversation(id), fetchMessages(id, { page: 1, pageSize: 30 })])
    } catch (e) {
      error.value = normalizeError(e).message
    } finally {
      loading.value = false
    }
  }

  const sendMessage = async (id: string, payload: { content: string }) => {
    const sent = await chatApi.sendMessage(id, payload)
    messages.value = sortBySentAtAsc([...messages.value, sent])
    return sent
  }

  const stopPolling = () => {
    if (pollingTimer.value) {
      window.clearInterval(pollingTimer.value)
      pollingTimer.value = null
    }
  }

  const startPolling = (id: string, interval = 7000) => {
    stopPolling()
    pollingTimer.value = window.setInterval(async () => {
      if (!selectedConversation.value) return
      await fetchMessages(id, { page: 1, pageSize: 30 })
    }, interval)
  }

  return {
    conversations,
    selectedConversation,
    messages,
    pollingTimer,
    loading,
    error,
    fetchConversations,
    createConversation,
    selectConversation,
    fetchConversation,
    fetchMessages,
    sendMessage,
    startPolling,
    stopPolling
  }
})
