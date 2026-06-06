import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { chatApi } from '@chat/api/chatApi'
import { notificationRealtimeClient } from '@chat/services/notificationRealtime'
import { normalizeError } from '@shared/utils/errorMapper'
import type { NotificationItem, NotificationRealtimeEvent, NotificationResponse } from '@chat/types/chat.types'
import { useAuthStore } from '../../../app/stores/authStore'

export const useNotificationStore = defineStore('notifications', () => {
  const auth = useAuthStore()
  const notifications = ref<NotificationItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const unreadCount = computed(() => notifications.value.filter((item) => !item.read).length)
  const isRealtimeConnected = ref(false)

  const sortByCreatedAtDesc = (list: NotificationItem[]) =>
    [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const upsertNotification = (item: NotificationItem) => {
    const existingIndex = notifications.value.findIndex((entry) => entry.id === item.id)
    if (existingIndex === -1) {
      notifications.value = sortByCreatedAtDesc([item, ...notifications.value])
      return
    }

    notifications.value = notifications.value.map((entry) => (entry.id === item.id ? { ...entry, ...item } : entry))
  }

  const handleRealtimeNotification = (event: NotificationRealtimeEvent) => {
    upsertNotification({
      id: event.notificationId,
      type: event.type,
      title: event.title,
      message: event.message,
      read: event.read,
      createdAt: event.createdAt,
      resourceType: event.resourceType ?? undefined,
      resourceId: event.resourceId ?? undefined
    })
  }

  const fetchNotifications = async (params?: { unreadOnly?: boolean; page?: number; pageSize?: number }) => {
    loading.value = true
    error.value = null
    try {
      const response = await chatApi.getNotifications(params)
      // Backend may return either a paginated object ({ data: [...] }) or a plain array.
      const list = Array.isArray(response)
        ? response
        : Array.isArray((response as NotificationResponse).data)
          ? (response as NotificationResponse).data
          : []
      notifications.value = sortByCreatedAtDesc(list)
    } catch (e) {
      error.value = normalizeError(e).message
      notifications.value = []
    } finally {
      loading.value = false
    }
  }

  const fetchUnreadNotifications = async () => fetchNotifications({ unreadOnly: true, page: 1, pageSize: 5 })

  const connectRealtime = () => {
    const userId = auth.user?.id
    if (!auth.token || !userId) {
      return
    }

    notificationRealtimeClient.configure(() => auth.token, handleRealtimeNotification)
    notificationRealtimeClient.connect()
    notificationRealtimeClient.subscribeUserNotifications(userId)
    isRealtimeConnected.value = true
  }

  const disconnectRealtime = () => {
    notificationRealtimeClient.disconnect()
    isRealtimeConnected.value = false
    notifications.value = []
    error.value = null
  }

  const markAsRead = async (id: string) => {
    await chatApi.markNotificationRead(id)
    notifications.value = notifications.value.map((item) => (item.id === id ? { ...item, read: true } : item))
  }

  const markAllAsRead = async () => {
    await chatApi.markAllNotificationsRead()
    notifications.value = notifications.value.map((item) => ({ ...item, read: true }))
  }

  return {
    notifications,
    unreadCount,
    loading,
    error,
    isRealtimeConnected,
    fetchNotifications,
    fetchUnreadNotifications,
    connectRealtime,
    disconnectRealtime,
    markAsRead,
    markAllAsRead
  }
})
