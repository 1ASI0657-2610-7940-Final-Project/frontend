import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs'
import type { ChatMessageCreatedEvent } from '@chat/types/chat.types'

type TokenGetter = () => string | null
type MessageHandler = (event: ChatMessageCreatedEvent) => void

const resolveChatWsUrl = () => {
  const explicitWs = import.meta.env.VITE_CHAT_WS_URL?.trim()
  if (explicitWs) {
    return explicitWs
  }

  const serviceUrl = import.meta.env.VITE_CHAT_SERVICE_URL?.trim().replace(/\/$/, '')
  if (serviceUrl) {
    return `${serviceUrl.replace(/^http/, 'ws')}/ws`
  }

  return 'ws://localhost:8084/ws'
}

class ChatRealtimeClient {
  private client: Client | null = null
  private activeConversationId: string | null = null
  private subscription: StompSubscription | null = null
  private tokenGetter: TokenGetter = () => null
  private handler: MessageHandler = () => {}

  configure(tokenGetter: TokenGetter, handler: MessageHandler) {
    this.tokenGetter = tokenGetter
    this.handler = handler
    this.ensureClient()
  }

  connect() {
    const client = this.ensureClient()
    if (client.active || client.connected) {
      return
    }

    client.beforeConnect = () => {
      const token = this.tokenGetter()
      client.connectHeaders = token ? { Authorization: `Bearer ${token}` } : {}
    }

    client.activate()
  }

  subscribeConversation(conversationId: string) {
    this.activeConversationId = conversationId
    this.connect()
    this.resubscribe()
  }

  disconnect() {
    this.subscription?.unsubscribe()
    this.subscription = null
    this.activeConversationId = null
    if (this.client?.active) {
      void this.client.deactivate()
    }
  }

  private ensureClient() {
    if (this.client) {
      return this.client
    }

    this.client = new Client({
      brokerURL: resolveChatWsUrl(),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: () => {},
      onConnect: () => {
        this.resubscribe()
      },
      onStompError: () => {},
      onWebSocketClose: () => {
        this.subscription = null
      }
    })

    return this.client
  }

  private resubscribe() {
    const client = this.client
    if (!client?.connected || !this.activeConversationId) {
      return
    }

    this.subscription?.unsubscribe()
    this.subscription = client.subscribe(`/topic/conversations/${this.activeConversationId}`, (frame: IMessage) => {
      try {
        const event = JSON.parse(frame.body) as ChatMessageCreatedEvent
        this.handler(event)
      } catch {
        // Ignore malformed websocket frames.
      }
    })
  }
}

export const chatRealtimeClient = new ChatRealtimeClient()
