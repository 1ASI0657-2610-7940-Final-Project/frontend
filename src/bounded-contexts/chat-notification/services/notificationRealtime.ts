import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs'
import type { NotificationRealtimeEvent } from '@chat/types/chat.types'

type TokenGetter = () => string | null
type NotificationHandler = (event: NotificationRealtimeEvent) => void

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

class NotificationRealtimeClient {
  private client: Client | null = null
  private subscription: StompSubscription | null = null
  private userId: string | null = null
  private tokenGetter: TokenGetter = () => null
  private handler: NotificationHandler = () => {}

  configure(tokenGetter: TokenGetter, handler: NotificationHandler) {
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

  subscribeUserNotifications(userId: string) {
    this.userId = userId
    this.connect()
    this.resubscribe()
  }

  disconnect() {
    this.subscription?.unsubscribe()
    this.subscription = null
    this.userId = null
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
    if (!client?.connected || !this.userId) {
      return
    }

    this.subscription?.unsubscribe()
    this.subscription = client.subscribe(`/topic/notifications/${this.userId}`, (frame: IMessage) => {
      try {
        const event = JSON.parse(frame.body) as NotificationRealtimeEvent
        this.handler(event)
      } catch {
        // Ignore malformed websocket frames.
      }
    })
  }
}

export const notificationRealtimeClient = new NotificationRealtimeClient()
