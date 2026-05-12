<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import NotificationDropdown from '@chat/components/NotificationDropdown.vue'
import giguLogo from '@shared/assets/brand/GigU_Typo.png'

const router = useRouter()
const auth = useAuthStore()
const menuOpen = ref(false)

const links = computed(() => {
  if (!auth.isAuthenticated) {
    return [
      { label: 'Marketplace', to: '/marketplace' },
      { label: 'Login', to: '/login' },
      { label: 'Register', to: '/register' }
    ]
  }

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
  <div class="app-shell">
    <header class="topbar">
      <RouterLink class="brand" to="/marketplace">
        <img :src="giguLogo" alt="GigU" />
      </RouterLink>

      <button class="menu-btn" @click="menuOpen = !menuOpen">Menu</button>

      <nav class="nav" :class="{ open: menuOpen }">
        <RouterLink v-for="item in links" :key="item.label" :to="item.to" @click="menuOpen = false">{{ item.label }}</RouterLink>
        <button v-if="auth.isAuthenticated" class="logout" @click="logout">Logout</button>
      </nav>

      <NotificationDropdown v-if="auth.isAuthenticated" />
    </header>

    <main class="container section"><RouterView /></main>
  </div>
</template>

<style scoped>
.app-shell { min-height: 100vh; }
.topbar { height: 68px; border-bottom: 1px solid var(--color-border); background: var(--color-white); display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 1rem; padding: 0 1.5rem; position: sticky; top: 0; z-index: 20; }
.brand { display: inline-flex; align-items: center; }
.brand img { height: 36px; width: auto; display: block; }
.menu-btn { display: none; border: 1px solid var(--color-border); border-radius: 8px; background: #fff; padding: 0.35rem 0.7rem; }
.nav { display: flex; justify-content: center; gap: 1.1rem; color: var(--color-text-muted); font-weight: 600; align-items: center; }
.logout { border: none; background: transparent; color: #b42318; font-weight: 700; }
.section { padding: 2rem 0; }
@media (max-width: 900px) {
  .topbar { grid-template-columns: auto auto auto; }
  .menu-btn { display: inline-flex; }
  .nav { position: absolute; left: 0; right: 0; top: 68px; background: #fff; border-bottom: 1px solid var(--color-border); padding: 0.75rem 1rem; display: none; flex-direction: column; align-items: flex-start; }
  .nav.open { display: flex; }
}
</style>
