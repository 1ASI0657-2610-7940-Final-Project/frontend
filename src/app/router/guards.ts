import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import type { UserRole } from '../../shared/types/common.types'
import { useAuthStore } from '../stores/authStore'

export const authGuard = (to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
  const auth = useAuthStore()
  if (!auth.token) return next('/login')
  const roles = to.meta.roles as UserRole[] | undefined
  if (roles?.length && !roles.some((role) => auth.hasRole(role))) return next('/forbidden')
  next()
}
