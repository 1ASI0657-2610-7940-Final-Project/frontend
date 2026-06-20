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

  const mockConversations = ref<ConversationSummary[]>([
    {
      id: 'mock-sarah',
      lastMessage: "The updated designs look great. I'll review the rest today.",
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
      participants: [{ id: 'sarah', displayName: 'Sarah Jenkins' }]
    },
    {
      id: 'mock-mark',
      lastMessage: 'Are you available for a quick',
      lastMessageAt: new Date(Date.now() - 86400000).toISOString(),
      unreadCount: 2,
      participants: [{ id: 'mark', displayName: 'Mark Davis' }]
    },
    {
      id: 'mock-alex',
      lastMessage: 'Thanks for sending over the proposal. We will get back to you by Friday.',
      lastMessageAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      unreadCount: 0,
      participants: [{ id: 'alex', displayName: 'Alex Chen - TechNova' }]
    },
    {
      id: 'mock-emily',
      lastMessage: "Let's proceed with milestone 2.",
      lastMessageAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      unreadCount: 0,
      participants: [{ id: 'emily', displayName: 'Emily Wong' }]
    }
  ])

  const mockMessagesMap = ref<Record<string, ChatMessage[]>>({
    'mock-sarah': [
      {
        id: 'mock-m1',
        conversationId: 'mock-sarah',
        senderId: 'sarah',
        content: 'Hi there! I took a look at the initial wireframes you sent over for the dashboard project.',
        sentAt: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: 'mock-m2',
        conversationId: 'mock-sarah',
        senderId: authStore.user?.id || 'me',
        content: "Great! Any immediate thoughts or areas you'd like to adjust before I move into higher fidelity?",
        sentAt: new Date(Date.now() - 6900000).toISOString()
      },
      {
        id: 'mock-m3',
        conversationId: 'mock-sarah',
        senderId: 'sarah',
        content: 'Overall structure looks solid. Could we make the metrics cards at the top slightly more prominent? Maybe adjust the shadow depth as discussed in the style guide.',
        sentAt: new Date(Date.now() - 6600000).toISOString()
      },
      {
        id: 'mock-m4',
        conversationId: 'mock-sarah',
        senderId: 'sarah',
        content: "The updated designs look great. I'll review the rest today.",
        sentAt: new Date(Date.now() - 6480000).toISOString()
      }
    ],
    'mock-mark': [
      {
        id: 'mock-m-m1',
        conversationId: 'mock-mark',
        senderId: 'mark',
        content: 'Hey, are you around?',
        sentAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'mock-m-m2',
        conversationId: 'mock-mark',
        senderId: 'mark',
        content: 'Are you available for a quick',
        sentAt: new Date(Date.now() - 86400000 + 60000).toISOString()
      }
    ],
    'mock-alex': [
      {
        id: 'mock-a-m1',
        conversationId: 'mock-alex',
        senderId: 'alex',
        content: 'Thanks for sending over the proposal. We will get back to you by Friday.',
        sentAt: new Date(Date.now() - 86400000 * 4).toISOString()
      }
    ],
    'mock-emily': [
      {
        id: 'mock-e-m1',
        conversationId: 'mock-emily',
        senderId: 'emily',
        content: "Let's proceed with milestone 2.",
        sentAt: new Date(Date.now() - 86400000 * 10).toISOString()
      }
    ]
  })

  const fetchConversations = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await chatApi.getConversations()
      if (res && res.length > 0) {
        conversations.value = res
      } else {
        conversations.value = [...mockConversations.value]
      }
    } catch (e) {
      console.warn('[chat] failed to load conversations, using mock fallback', e)
      conversations.value = [...mockConversations.value]
    } finally {
      loading.value = false
    }
  }

  const createConversation = async (payload: CreateConversationPayload) => chatApi.createConversation(payload)

  const fetchConversation = async (id: string) => {
    if (id.startsWith('mock-')) {
      const mockConv = mockConversations.value.find((c) => c.id === id)
      if (mockConv) {
        selectedConversation.value = {
          id: mockConv.id,
          participants: mockConv.participants,
          createdAt: new Date().toISOString()
        }
      }
      return
    }
    try {
      selectedConversation.value = await chatApi.getConversation(id)
    } catch (e) {
      console.error('[chat] failed to load conversation detail', { conversationId: id, error: e })
      throw e
    }
  }

  const fetchMessages = async (id: string, params?: { page?: number; pageSize?: number }) => {
    if (id.startsWith('mock-')) {
      // Ensure local 'me' is synced with actual user ID
      const list = mockMessagesMap.value[id] || []
      const meId = authStore.user?.id || 'me'
      messages.value = list.map(msg => ({
        ...msg,
        senderId: msg.senderId === 'me' || msg.senderId === authStore.user?.id ? meId : msg.senderId
      }))
      return
    }
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
      
      // Update unread count locally for mock conversations
      if (id.startsWith('mock-')) {
        conversations.value = conversations.value.map(c => {
          if (c.id === id) {
            return { ...c, unreadCount: 0 }
          }
          return c
        })
      } else {
        connectRealtime()
      }
    } catch (e) {
      console.error('[chat] failed to select conversation', { conversationId: id, error: e })
      error.value = normalizeError(e).message
    } finally {
      loading.value = false
    }
  }

  const sendMessage = async (id: string, payload: { content: string }) => {
    if (id.startsWith('mock-')) {
      const meId = authStore.user?.id || 'me'
      const sent: ChatMessage = {
        id: 'mock-msg-' + Date.now(),
        conversationId: id,
        senderId: meId,
        content: payload.content,
        sentAt: new Date().toISOString()
      }
      
      // Save locally
      if (!mockMessagesMap.value[id]) {
        mockMessagesMap.value[id] = []
      }
      mockMessagesMap.value[id].push(sent)
      messages.value = [...messages.value, sent]

      // Update snippet in conversation summary list
      conversations.value = conversations.value.map(c => {
        if (c.id === id) {
          return {
            ...c,
            lastMessage: payload.content,
            lastMessageAt: sent.sentAt
          }
        }
        return c
      })
      
      return sent
    }
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
