import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { chatApi } from '@chat/api/chatApi'
import { normalizeError } from '@shared/utils/errorMapper'
import type { NotificationItem } from '@chat/types/chat.types'

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref<NotificationItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const unreadCount = computed(() => notifications.value.filter((item) => !item.read).length)

  const fetchNotifications = async (params?: { unreadOnly?: boolean; page?: number; pageSize?: number }) => {
    loading.value = true
    error.value = null
    try {
      const response = await chatApi.getNotifications(params)
      notifications.value = response.data
    } catch (e) {
      error.value = normalizeError(e).message
    } finally {
      loading.value = false
    }
  }

  const fetchUnreadNotifications = async () => fetchNotifications({ unreadOnly: true, page: 1, pageSize: 5 })

  const markAsRead = async (id: string) => {
    await chatApi.markNotificationRead(id)
    notifications.value = notifications.value.map((item) => (item.id === id ? { ...item, read: true } : item))
  }

  const markAllAsRead = async () => {
    await chatApi.markAllNotificationsRead()
    notifications.value = notifications.value.map((item) => ({ ...item, read: true }))
  }

  return { notifications, unreadCount, loading, error, fetchNotifications, fetchUnreadNotifications, markAsRead, markAllAsRead }
})
