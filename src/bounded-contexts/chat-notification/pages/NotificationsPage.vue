<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import NotificationList from '../components/NotificationList.vue'
import LoadingState from '../../../shared/components/LoadingState.vue'
import EmptyState from '../../../shared/components/EmptyState.vue'
import ErrorState from '../../../shared/components/ErrorState.vue'
import { useNotificationStore } from '@chat/stores/notificationStore'
import type { NotificationItem } from '@chat/types/chat.types'

const store = useNotificationStore()
const router = useRouter()
const filter = ref<'ALL' | 'UNREAD' | 'READ'>('ALL')

const filtered = computed(() => {
  if (filter.value === 'UNREAD') return store.notifications.filter((item) => !item.read)
  if (filter.value === 'READ') return store.notifications.filter((item) => item.read)
  return store.notifications
})

onMounted(async () => {
  await store.fetchNotifications({ page: 1, pageSize: 20 })
})

const openNotification = async (item: NotificationItem) => {
  if (item.resourceType === 'PROJECT' && item.resourceId) {
    await router.push(`/projects/${item.resourceId}`)
    return
  }
  if (item.resourceType === 'REQUEST' && item.resourceId) {
    await router.push('/client/requests')
    return
  }
  if (item.resourceType === 'CONVERSATION' && item.resourceId) {
    await router.push(`/chat?conversationId=${item.resourceId}`)
  }
}
</script>

<template>
  <section class="page">
    <header class="head">
      <div>
        <h1 class="page-title">Notifications</h1>
        <p class="muted">Track all activity and platform updates.</p>
      </div>
      <button @click="store.markAllAsRead">Mark all as read</button>
    </header>

    <div class="filters">
      <button :class="{ active: filter === 'ALL' }" @click="filter = 'ALL'">All</button>
      <button :class="{ active: filter === 'UNREAD' }" @click="filter = 'UNREAD'">Unread</button>
      <button :class="{ active: filter === 'READ' }" @click="filter = 'READ'">Read</button>
    </div>

    <ErrorState v-if="store.error" :message="store.error" />
    <LoadingState v-else-if="store.loading" />
    <EmptyState v-else-if="!filtered.length" title="No notifications" message="You are all caught up." />
    <NotificationList v-else :items="filtered" @read="store.markAsRead" @open="openNotification" />
  </section>
</template>

<style scoped>
.page { display: grid; gap: 1rem; }
.head { display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start; }
.head button { border: 1px solid var(--color-primary); color: var(--color-primary); background: #fff; border-radius: 8px; padding: 0.55rem 0.75rem; font-weight: 700; }
.filters { display: flex; gap: 0.5rem; }
.filters button { border: 1px solid var(--color-border); border-radius: 999px; padding: 0.35rem 0.8rem; background: #fff; }
.filters .active { border-color: var(--color-primary); background: #eaf2ff; color: #0a66c2; }
</style>
