<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import NotificationDropdown from '@chat/components/NotificationDropdown.vue'
import giguLogo from '@shared/assets/brand/GigU_Typo.png'

const auth = useAuthStore()
const router = useRouter()
const sidebarOpen = ref(false)

const menuItems = computed(() => {
  if (auth.user?.role === 'CLIENT') {
    return [
      { label: 'Dashboard', to: '/client/dashboard' },
      { label: 'Marketplace', to: '/marketplace' },
      { label: 'Requests', to: '/client/requests' },
      { label: 'Projects', to: '/projects' },
      { label: 'Chat', to: '/chat' },
      { label: 'Notifications', to: '/notifications' },
      { label: 'Support', to: '/support' }
    ]
  }
  return [
    { label: 'Dashboard', to: '/freelancer/dashboard' },
    { label: 'My Gigs', to: '/freelancer/gigs' },
    { label: 'Requests', to: '/freelancer/requests' },
    { label: 'Projects', to: '/projects' },
    { label: 'Chat', to: '/chat' },
    { label: 'Notifications', to: '/notifications' },
    { label: 'Support', to: '/support' }
  ]
})

const logout = () => {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="dashboard-layout">
    <button class="sidebar-toggle" @click="sidebarOpen = !sidebarOpen">Menu</button>
    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <div class="logo">
        <img :src="giguLogo" alt="GigU" />
      </div>
      <div class="muted">{{ auth.user?.role === 'CLIENT' ? 'Client Portal' : 'Freelancer Portal' }}</div>
      <nav class="menu">
        <RouterLink v-for="item in menuItems" :key="item.label" :to="item.to" @click="sidebarOpen = false">{{ item.label }}</RouterLink>
      </nav>
      <button class="logout" @click="logout">Logout</button>
    </aside>

    <section class="content">
      <div class="content-top">
        <NotificationDropdown v-if="auth.isAuthenticated" />
      </div>
      <RouterView />
    </section>
  </div>
</template>

<style scoped>
.dashboard-layout { min-height: 100vh; display: grid; grid-template-columns: 260px 1fr; }
.sidebar-toggle { display: none; position: fixed; top: 12px; left: 12px; z-index: 30; border: 1px solid var(--color-border); background: #fff; border-radius: 8px; padding: 0.4rem 0.7rem; }
.sidebar { background: #eef0fb; border-right: 1px solid var(--color-border); padding: 1.5rem 1rem; display: grid; align-content: start; gap: 0.75rem; }
.logo { display: inline-flex; align-items: center; }
.logo img { width: auto; height: 34px; display: block; }
.menu { margin-top: 1rem; display: grid; gap: 0.45rem; }
.menu a { padding: 0.8rem 1rem; border-radius: var(--radius-md); color: #374151; font-weight: 600; }
.menu a.router-link-active { background: var(--color-primary); color: var(--color-white); }
.logout { margin-top: 1rem; border: 1px solid #f2c7c7; background: #fff3f3; color: #b42318; border-radius: 8px; padding: 0.55rem 0.75rem; font-weight: 700; }
.content { padding: 1.5rem; }
.content-top { display: flex; justify-content: flex-end; margin-bottom: 1rem; }
@media (max-width: 980px) {
  .dashboard-layout { grid-template-columns: 1fr; }
  .sidebar-toggle { display: inline-flex; }
  .sidebar { position: fixed; top: 0; bottom: 0; left: 0; width: 280px; z-index: 25; transform: translateX(-100%); transition: transform 0.2s ease; }
  .sidebar.open { transform: translateX(0); }
  .content { padding-top: 4.2rem; }
}
</style>
