<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const auth = useAuthStore()
const router = useRouter()
const sidebarOpen = ref(false)

const isFreelancer = computed(() => auth.user?.role === 'FREELANCER')

const clientMenu = [
  { label: 'Dashboard', to: '/client/dashboard', icon: 'grid' },
  { label: 'Marketplace', to: '/marketplace', icon: 'shop' },
  { label: 'Requests', to: '/client/requests', icon: 'inbox' },
  { label: 'Projects', to: '/projects', icon: 'folder' },
  { label: 'Chat', to: '/chat', icon: 'chat' },
  { label: 'Notifications', to: '/notifications', icon: 'bell' },
  { label: 'Support', to: '/support', icon: 'help' },
]

const freelancerMenu = [
  { label: 'Dashboard', to: '/freelancer/dashboard', icon: 'grid' },
  { label: 'My Gigs', to: '/freelancer/gigs', icon: 'briefcase' },
  { label: 'Projects', to: '/projects', icon: 'folder' },
  { label: 'Requests', to: '/freelancer/requests', icon: 'inbox' },
  { label: 'Analytics', to: '/notifications', icon: 'chart' },
]

const menuItems = computed(() => auth.user?.role === 'CLIENT' ? clientMenu : freelancerMenu)

const userInitials = computed(() => {
  const email = auth.user?.email || 'U'
  return email.slice(0, 2).toUpperCase()
})

const portalLabel = computed(() => auth.user?.role === 'CLIENT' ? 'Client Portal' : 'Freelancer Portal')

const logout = () => {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="dashboard-layout">
    <button class="sidebar-toggle" @click="sidebarOpen = !sidebarOpen">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
    </button>

    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <!-- User header -->
      <div class="sidebar-header">
        <div class="user-avatar">{{ userInitials }}</div>
        <div class="user-info">
          <span class="user-title">GigU Dashboard</span>
          <span class="user-portal">{{ portalLabel }}</span>
        </div>
      </div>

      <div class="sidebar-divider" />

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <RouterLink
          v-for="item in menuItems"
          :key="item.label"
          :to="item.to"
          class="nav-item"
          @click="sidebarOpen = false"
        >
          <!-- Grid icon -->
          <svg v-if="item.icon === 'grid'" xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          <!-- Briefcase icon -->
          <svg v-else-if="item.icon === 'briefcase'" xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
          <!-- Folder icon -->
          <svg v-else-if="item.icon === 'folder'" xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          <!-- Inbox icon -->
          <svg v-else-if="item.icon === 'inbox'" xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
          <!-- Chart icon -->
          <svg v-else-if="item.icon === 'chart'" xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          <!-- Shop/marketplace icon -->
          <svg v-else-if="item.icon === 'shop'" xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          <!-- Chat icon -->
          <svg v-else-if="item.icon === 'chat'" xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <!-- Bell icon -->
          <svg v-else-if="item.icon === 'bell'" xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <!-- Help icon -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <!-- Footer -->
      <div class="sidebar-footer">
        <RouterLink v-if="isFreelancer" to="/freelancer/gigs/new" class="post-gig-btn">
          + Post a Gig
        </RouterLink>
        <div class="footer-links">
          <button class="footer-link logout-link" @click="logout">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/><path d="M13 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8"/></svg>
            Logout
          </button>
          <RouterLink to="/support" class="footer-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Help
          </RouterLink>
        </div>
      </div>
    </aside>

    <section class="content">
      <RouterView />
    </section>
  </div>
</template>

<style scoped>
.dashboard-layout { min-height: 100vh; display: grid; grid-template-columns: 210px 1fr; background: #f4f6fb; }

/* Sidebar */
.sidebar { background: #fff; border-right: 1px solid #e5e9f2; padding: 1.25rem 0.85rem; display: flex; flex-direction: column; gap: 0; min-height: 100vh; }
.sidebar-header { display: flex; align-items: center; gap: 0.75rem; padding: 0.25rem 0.5rem 1rem; }
.user-avatar { width: 42px; height: 42px; border-radius: 50%; background: var(--color-primary); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.875rem; flex-shrink: 0; overflow: hidden; }
.user-info { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.user-title { font-weight: 700; font-size: 0.8rem; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-portal { font-size: 0.72rem; color: #94a3b8; }
.sidebar-divider { height: 1px; background: #e5e9f2; margin: 0 0 0.75rem; }

/* Nav */
.sidebar-nav { display: flex; flex-direction: column; gap: 0.2rem; flex: 1; }
.nav-item { display: flex; align-items: center; gap: 0.65rem; padding: 0.65rem 0.85rem; border-radius: 8px; color: #64748b; font-weight: 500; font-size: 0.875rem; text-decoration: none; transition: background 0.15s, color 0.15s; }
.nav-item:hover { background: #f4f6fb; color: #0f172a; }
.nav-item.router-link-active { background: var(--color-primary); color: #fff; }
.nav-item svg { flex-shrink: 0; }

/* Footer */
.sidebar-footer { display: flex; flex-direction: column; gap: 0.5rem; padding-top: 1rem; border-top: 1px solid #e5e9f2; margin-top: 0.75rem; }
.post-gig-btn { display: flex; align-items: center; justify-content: center; background: var(--color-primary); color: #fff; border: none; border-radius: 8px; padding: 0.7rem; font-weight: 700; font-size: 0.875rem; cursor: pointer; text-decoration: none; }
.footer-links { display: flex; flex-direction: column; gap: 0.15rem; }
.footer-link { display: flex; align-items: center; gap: 0.6rem; padding: 0.5rem 0.75rem; border-radius: 8px; color: #64748b; font-size: 0.8rem; font-weight: 500; background: none; border: none; cursor: pointer; text-decoration: none; transition: background 0.15s; }
.footer-link:hover { background: #f4f6fb; color: #0f172a; }
.logout-link { color: #b42318; }
.logout-link:hover { background: #fef2f2; color: #b42318; }

/* Content */
.content { padding: 1.75rem 2rem; overflow-y: auto; }
.sidebar-toggle { display: none; position: fixed; top: 12px; left: 12px; z-index: 30; border: 1px solid var(--color-border); background: #fff; border-radius: 8px; padding: 0.4rem; }

@media (max-width: 980px) {
  .dashboard-layout { grid-template-columns: 1fr; }
  .sidebar-toggle { display: flex; }
  .sidebar { position: fixed; top: 0; bottom: 0; left: 0; width: 220px; z-index: 25; transform: translateX(-100%); transition: transform 0.2s ease; }
  .sidebar.open { transform: translateX(0); }
  .content { padding: 4.5rem 1rem 1.5rem; }
}
</style>
