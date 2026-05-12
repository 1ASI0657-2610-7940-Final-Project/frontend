import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from './guards'
import AppLayout from '../layouts/AppLayout.vue'
import AuthLayout from '../layouts/AuthLayout.vue'
import DashboardLayout from '../layouts/DashboardLayout.vue'
import PlaceholderPage from '../../pages/PlaceholderPage.vue'
import ForbiddenPage from '../../pages/ForbiddenPage.vue'
import NotFoundPage from '../../pages/NotFoundPage.vue'
import { useAuthStore } from '../stores/authStore'
import MarketplacePage from '@marketplace/pages/MarketplacePage.vue'
import GigDetailPage from '@marketplace/pages/GigDetailPage.vue'
import MyGigsPage from '@marketplace/pages/MyGigsPage.vue'
import CreateGigPage from '@marketplace/pages/CreateGigPage.vue'
import EditGigPage from '@marketplace/pages/EditGigPage.vue'
import ClientRequestsPage from '@pulls/pages/ClientRequestsPage.vue'
import IncomingRequestsPage from '@pulls/pages/IncomingRequestsPage.vue'
import ProjectsPage from '@pulls/pages/ProjectsPage.vue'
import ProjectDetailPage from '@pulls/pages/ProjectDetailPage.vue'
import ChatPage from '@chat/pages/ChatPage.vue'
import NotificationsPage from '@chat/pages/NotificationsPage.vue'
import SupportTicketPage from '@chat/pages/SupportTicketPage.vue'
import ClientDashboardPage from '../pages/dashboard/ClientDashboardPage.vue'
import FreelancerDashboardPage from '../pages/dashboard/FreelancerDashboardPage.vue'
import LoginPage from '@access/pages/LoginPage.vue'
import RegisterPage from '@access/pages/RegisterPage.vue'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    roles?: ('CLIENT' | 'FREELANCER')[]
  }
}

const makePlaceholder = (title: string, subtitle: string) => ({ component: PlaceholderPage, props: { title, subtitle } })

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: AppLayout,
      children: [
        { path: '', redirect: '/marketplace' },
        { path: 'marketplace', component: MarketplacePage },
        { path: 'marketplace/services/:id', component: GigDetailPage },
        { path: 'forbidden', component: ForbiddenPage }
      ]
    },
    {
      path: '/',
      component: AuthLayout,
      children: [
        { path: 'login', component: LoginPage },
        { path: 'register', component: RegisterPage }
      ]
    },
    {
      path: '/',
      component: DashboardLayout,
      children: [
        { path: 'client/dashboard', component: ClientDashboardPage, meta: { requiresAuth: true, roles: ['CLIENT'] } },
        { path: 'client/requests', component: ClientRequestsPage, meta: { requiresAuth: true, roles: ['CLIENT'] } },
        { path: 'freelancer/dashboard', component: FreelancerDashboardPage, meta: { requiresAuth: true, roles: ['FREELANCER'] } },
        { path: 'freelancer/gigs', component: MyGigsPage, meta: { requiresAuth: true, roles: ['FREELANCER'] } },
        { path: 'freelancer/gigs/new', component: CreateGigPage, meta: { requiresAuth: true, roles: ['FREELANCER'] } },
        { path: 'freelancer/gigs/:id/edit', component: EditGigPage, meta: { requiresAuth: true, roles: ['FREELANCER'] } },
        { path: 'freelancer/profile', ...makePlaceholder('Edit Profile', 'Manage professional identity and portfolio.'), meta: { requiresAuth: true, roles: ['FREELANCER'] } },
        { path: 'freelancer/requests', component: IncomingRequestsPage, meta: { requiresAuth: true, roles: ['FREELANCER'] } },
        { path: 'projects', component: ProjectsPage, meta: { requiresAuth: true } },
        { path: 'projects/:id', component: ProjectDetailPage, meta: { requiresAuth: true } },
        { path: 'chat', component: ChatPage, meta: { requiresAuth: true } },
        { path: 'notifications', component: NotificationsPage, meta: { requiresAuth: true } },
        { path: 'support', component: SupportTicketPage, meta: { requiresAuth: true } }
      ]
    },
    { path: '/not-found', component: NotFoundPage },
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
