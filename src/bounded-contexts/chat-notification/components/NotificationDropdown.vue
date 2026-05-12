<script setup lang="ts">
import { onMounted } from 'vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@chat/stores/notificationStore'
import { useAuthStore } from '../../../app/stores/authStore'

const store = useNotificationStore()
const auth = useAuthStore()
const router = useRouter()
const open = ref(false)

const openNotifications = () => {
  open.value = false
  router.push('/notifications')
}

onMounted(async () => {
  if (auth.isAuthenticated) await store.fetchUnreadNotifications()
})
</script>

<template>
  <div class="dropdown">
    <button v-if="!auth.isAuthenticated" class="trigger" @click="router.push('/login')">Login</button>
    <button v-else class="trigger" @click="open = !open">
      Notifications
      <span v-if="store.unreadCount" class="badge">{{ store.unreadCount }}</span>
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
.dropdown { position: relative; }
.trigger { border: 1px solid var(--color-border); border-radius: 999px; padding: 0.35rem 0.75rem; background: #fff; font-weight: 700; }
.badge { margin-left: 0.4rem; background: var(--color-primary); color: #fff; border-radius: 999px; padding: 2px 7px; font-size: 12px; }
.menu { position: absolute; right: 0; top: calc(100% + 8px); width: 350px; z-index: 20; padding: 0.75rem; display: grid; gap: 0.55rem; }
header { display: flex; justify-content: space-between; align-items: center; }
header button { border: none; background: transparent; color: var(--color-primary); font-weight: 700; }
.item { border: 1px solid var(--color-border); border-radius: 10px; text-align: left; background: #fff; padding: 0.55rem; }
.item p { margin: 0.3rem 0 0; color: #475569; font-size: 14px; }
.all { border: none; background: #edf3ff; color: #0a66c2; border-radius: 8px; padding: 0.5rem; font-weight: 700; }
</style>
