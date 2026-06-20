<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@chat/stores/notificationStore'
import { useAuthStore } from '../../../app/stores/authStore'

const store = useNotificationStore()
const auth = useAuthStore()
const router = useRouter()
const open = ref(false)
const canConnect = computed(() => auth.isAuthenticated && Boolean(auth.user?.id))

const openNotifications = () => {
  open.value = false
  router.push('/notifications')
}

const syncRealtime = () => {
  if (canConnect.value && auth.user?.id) {
    store.connectRealtime()
    store.fetchUnreadNotifications().catch(() => {})
    return
  }

  store.disconnectRealtime()
}

onMounted(async () => {
  syncRealtime()
})

watch(
  () => [auth.isAuthenticated, auth.user?.id],
  () => {
    syncRealtime()
  }
)

onBeforeUnmount(() => {
  store.disconnectRealtime()
})
</script>

<template>
  <div class="dropdown">
    <button v-if="!auth.isAuthenticated" class="trigger" @click="router.push('/login')">Login</button>
    <button v-else class="trigger-btn" @click="open = !open" aria-label="Notifications">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      <span v-if="store.unreadCount" class="badge"></span>
    </button>
    <div class="menu card" v-if="open && auth.isAuthenticated">
      <header>
        <strong>Latest</strong>
        <button @click="store.markAllAsRead">Mark all as read</button>
      </header>
      <button v-for="item in store.notifications" :key="item.id" class="item" @click="store.markAsRead(item.id)">
        <strong>{{ item.title }}</strong>
        <p>{{ item.message }}</p>
      </button>
      <button class="all" @click="openNotifications">View all notifications</button>
    </div>
  </div>
</template>

<style scoped>
.dropdown { position: relative; display: flex; align-items: center; }
.trigger-btn { border: none; background: none; padding: 0.35rem; cursor: pointer; display: flex; align-items: center; justify-content: center; position: relative; border-radius: 50%; transition: background 0.15s ease; }
.trigger-btn:hover { background: #f1f5f9; }
.badge { position: absolute; top: 2px; right: 2px; width: 8px; height: 8px; background: #ef4444; border-radius: 50%; border: 1.5px solid #fff; }
.menu { position: absolute; right: 0; top: calc(100% + 8px); width: 350px; z-index: 20; padding: 0.75rem; display: grid; gap: 0.55rem; }
header { display: flex; justify-content: space-between; align-items: center; }
header button { border: none; background: transparent; color: var(--color-primary); font-weight: 700; }
.item { border: 1px solid var(--color-border); border-radius: 10px; text-align: left; background: #fff; padding: 0.55rem; }
.item p { margin: 0.3rem 0 0; color: #475569; font-size: 14px; }
.all { border: none; background: #edf3ff; color: #0a66c2; border-radius: 8px; padding: 0.5rem; font-weight: 700; }
</style>
