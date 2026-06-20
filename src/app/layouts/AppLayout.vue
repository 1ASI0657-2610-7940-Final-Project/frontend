<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import NotificationDropdown from '@chat/components/NotificationDropdown.vue'
import giguLogo from '@shared/assets/brand/GigU_Typo.png'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const menuOpen = ref(false)

const isChatRoute = computed(() => route.path === '/chat')

const userInitials = computed(() => {
  const email = auth.user?.email || 'U'
  return email.slice(0, 2).toUpperCase()
})

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
      { label: 'Marketplace', to: '/marketplace' },
      { label: 'Messages', to: '/chat' },
      { label: 'Support', to: '/support' }
    ]
  }

  return [
    { label: 'Marketplace', to: '/marketplace' },
    { label: 'Messages', to: '/chat' },
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
      <!-- Left side: Brand + Search bar -->
      <div class="left-section">
        <RouterLink class="brand" to="/marketplace">
          <img :src="giguLogo" alt="GigU" />
        </RouterLink>
        <div class="header-search">
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="Search..." class="search-input" />
        </div>
      </div>

      <button class="menu-btn" @click="menuOpen = !menuOpen">Menu</button>

      <!-- Center section: Navigation links -->
      <nav class="nav" :class="{ open: menuOpen }">
        <RouterLink 
          v-for="item in links" 
          :key="item.label" 
          :to="item.to" 
          @click="menuOpen = false"
          class="nav-link"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <!-- Right section: Notifications + Messages + Profile -->
      <div class="right-section">
        <template v-if="auth.isAuthenticated">
          <!-- Notification Bell -->
          <NotificationDropdown />

          <!-- Messages Mail Envelope Icon -->
          <RouterLink to="/chat" class="icon-btn" aria-label="Messages">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </RouterLink>

          <!-- User Avatar -->
          <div class="user-avatar-circle">
            <img v-if="auth.user?.avatarUrl" :src="auth.user.avatarUrl" class="avatar-img" alt="Profile" />
            <div v-else class="avatar-placeholder">{{ userInitials }}</div>
          </div>

          <button class="logout-btn" @click="logout">Logout</button>
        </template>
        <template v-else>
          <RouterLink to="/login" class="login-btn">Login</RouterLink>
        </template>
      </div>
    </header>

    <main :class="[isChatRoute ? 'chat-main-container' : 'container section']">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-shell { min-height: 100vh; display: flex; flex-direction: column; }
.topbar { 
  height: 68px; 
  border-bottom: 1px solid #e5e9f2; 
  background: #ffffff; 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  padding: 0 1.75rem; 
  position: sticky; 
  top: 0; 
  z-index: 20; 
}

/* Left section brand + search */
.left-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.brand { display: inline-flex; align-items: center; }
.brand img { height: 36px; width: auto; display: block; }

.header-search {
  position: relative;
  display: flex;
  align-items: center;
}
.search-icon {
  position: absolute;
  left: 0.75rem;
  pointer-events: none;
}
.search-input {
  background: #f1f5f9;
  border: none;
  border-radius: 9999px;
  padding: 0.45rem 1rem 0.45rem 2.1rem;
  font-size: 0.8125rem;
  width: 200px;
  outline: none;
  transition: all 0.15s ease;
}
.search-input:focus {
  background: #e2e8f0;
  width: 240px;
}

.menu-btn { display: none; border: 1px solid var(--color-border); border-radius: 8px; background: #fff; padding: 0.35rem 0.7rem; }

/* Center navigation links */
.nav { 
  display: flex; 
  justify-content: center; 
  gap: 2.2rem; 
  color: #64748b; 
  font-weight: 500; 
  align-items: center; 
  height: 100%;
}
.nav-link {
  font-size: 0.875rem;
  color: #64748b;
  text-decoration: none;
  transition: color 0.15s;
  height: 100%;
  display: flex;
  align-items: center;
  position: relative;
  box-sizing: border-box;
}
.nav-link:hover {
  color: #0f172a;
}
.nav-link.router-link-active {
  color: #2563eb;
  font-weight: 700;
}
.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #2563eb;
  border-radius: 9999px;
}

/* Right section icons + user */
.right-section {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}
.icon-btn {
  border: none;
  background: none;
  padding: 0.35rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.15s ease;
}
.icon-btn:hover {
  background: #f1f5f9;
}

.user-avatar-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  background: #2563eb;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.75rem;
  flex-shrink: 0;
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-btn {
  border: 1px solid #e2e8f0;
  background: transparent;
  color: #b42318;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
}
.logout-btn:hover {
  background: #fef2f2;
}

.login-btn {
  font-size: 0.875rem;
  font-weight: 600;
  color: #2563eb;
}

/* Container classes */
.section { padding: 2rem 0; }
.chat-main-container {
  flex-grow: 1;
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0;
  height: calc(100vh - 68px);
  overflow: hidden;
}

@media (max-width: 900px) {
  .menu-btn { display: inline-flex; }
  .nav { 
    position: absolute; 
    left: 0; 
    right: 0; 
    top: 68px; 
    background: #fff; 
    border-bottom: 1px solid var(--color-border); 
    padding: 0.75rem 1rem; 
    display: none; 
    flex-direction: column; 
    align-items: flex-start; 
    height: auto;
    gap: 0.75rem;
  }
  .nav.open { display: flex; }
  .nav-link {
    height: auto;
    padding: 0.5rem 0;
    width: 100%;
  }
  .nav-link.router-link-active::after {
    display: none;
  }
  .header-search { display: none; }
}
</style>
