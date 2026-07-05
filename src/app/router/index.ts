import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from './guards'
import AppLayout from '../layouts/AppLayout.vue'
import AuthLayout from '../layouts/AuthLayout.vue'
import DashboardLayout from '../layouts/DashboardLayout.vue'
import { useAuthStore } from '../stores/authStore'

// GIGU-83: las páginas se cargan con dynamic imports (lazy-loading) para que Vite
// genere un chunk por ruta (code-splitting) y reduzca el bundle inicial. Los layouts
// se mantienen eager porque envuelven a todas las vistas y forman el shell de navegación.

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    roles?: ('CLIENT' | 'FREELANCER')[]
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: AppLayout,
      children: [
        { path: '', redirect: '/marketplace' },
        { path: 'marketplace', component: () => import('@marketplace/pages/MarketplacePage.vue') },
        { path: 'marketplace/services/:id', component: () => import('@marketplace/pages/GigDetailPage.vue') },
        { path: 'forbidden', component: () => import('../../pages/ForbiddenPage.vue') }
      ]
    },
    {
      path: '/',
      component: AuthLayout,
      children: [
        { path: 'login', component: () => import('@access/pages/LoginPage.vue') },
        { path: 'register', component: () => import('@access/pages/RegisterPage.vue') }
      ]
    },
    {
      path: '/',
      component: DashboardLayout,
      children: [
        { path: 'client/dashboard', component: () => import('../pages/dashboard/ClientDashboardPage.vue'), meta: { requiresAuth: true, roles: ['CLIENT'] } },
        { path: 'client/requests', component: () => import('@pulls/pages/ClientRequestsPage.vue'), meta: { requiresAuth: true, roles: ['CLIENT'] } },
        { path: 'freelancer/dashboard', component: () => import('../pages/dashboard/FreelancerDashboardPage.vue'), meta: { requiresAuth: true, roles: ['FREELANCER'] } },
        { path: 'freelancer/gigs', component: () => import('@marketplace/pages/MyGigsPage.vue'), meta: { requiresAuth: true, roles: ['FREELANCER'] } },
        { path: 'freelancer/gigs/:id/edit', component: () => import('@marketplace/pages/EditGigPage.vue'), meta: { requiresAuth: true, roles: ['FREELANCER'] } },
        { path: 'freelancer/profile', component: () => import('@access/pages/FreelancerProfilePage.vue'), meta: { requiresAuth: true, roles: ['FREELANCER'] } },
        { path: 'freelancer/requests', component: () => import('@pulls/pages/IncomingRequestsPage.vue'), meta: { requiresAuth: true, roles: ['FREELANCER'] } },
        { path: 'projects', component: () => import('@pulls/pages/ProjectsPage.vue'), meta: { requiresAuth: true } },
        { path: 'projects/:id', component: () => import('@pulls/pages/ProjectDetailPage.vue'), meta: { requiresAuth: true } },
        { path: 'chat', component: () => import('@chat/pages/ChatPage.vue'), meta: { requiresAuth: true } },
        { path: 'notifications', component: () => import('@chat/pages/NotificationsPage.vue'), meta: { requiresAuth: true } },
        { path: 'support', component: () => import('@chat/pages/SupportTicketPage.vue'), meta: { requiresAuth: true } }
      ]
    },
    {
      path: '/freelancer/gigs/new',
      component: () => import('@marketplace/pages/CreateGigPage.vue'),
      meta: { requiresAuth: true, roles: ['FREELANCER'] }
    },
    { path: '/not-found', component: () => import('../../pages/NotFoundPage.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/not-found' }
  ]
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (!auth.token && localStorage.getItem('gigu_token')) auth.hydrateSession()
  if (to.meta.requiresAuth) return authGuard(to, from, next)
  next()
})

export default router
