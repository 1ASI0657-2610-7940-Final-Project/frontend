import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { User, UserRole } from '../../shared/types/common.types'
import type { LoginPayload, RegisterPayload } from '@access/types/access.types'
import { accessApi } from '@access/api/accessApi'
import { normalizeError } from '../../shared/utils/errorMapper'

const TOKEN_KEY = 'gigu_token'
const USER_KEY = 'gigu_user'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isAuthenticated = computed(() => Boolean(token.value))
  const roles = computed<UserRole[]>(() => user.value?.roles ?? (user.value?.role ? [user.value.role] : []))
  const isClient = computed(() => roles.value.includes('CLIENT'))
  const isFreelancer = computed(() => roles.value.includes('FREELANCER'))

  const setSession = (nextToken: string, nextUser: User) => {
    const normalizedRoles = nextUser.roles ?? (nextUser.role ? [nextUser.role] : [])
    token.value = nextToken
    user.value = {
      ...nextUser,
      roles: normalizedRoles,
      role: nextUser.role ?? normalizedRoles[0]
    }
    localStorage.setItem(TOKEN_KEY, nextToken)
    localStorage.setItem(USER_KEY, JSON.stringify(user.value))
  }

  const clearSession = () => {
    token.value = null
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  const hydrateSession = () => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    const storedUser = localStorage.getItem(USER_KEY)
    if (storedToken) token.value = storedToken
    if (storedUser) {
      const parsed = JSON.parse(storedUser) as User
      const normalizedRoles = parsed.roles ?? (parsed.role ? [parsed.role] : [])
      user.value = { ...parsed, roles: normalizedRoles, role: parsed.role ?? normalizedRoles[0] }
    }
  }

  const hasRole = (role: UserRole) => roles.value.includes(role)

  const signUp = async (payload: RegisterPayload) => {
    loading.value = true
    error.value = null
    try {
      return await accessApi.signUp(payload)
    } catch (e) {
      const mapped = normalizeError(e)
      error.value = mapped.message
      throw mapped
    } finally {
      loading.value = false
    }
  }

  const login = async (payload: LoginPayload) => {
    loading.value = true
    error.value = null
    try {
      const response = await accessApi.login(payload)
      setSession(response.accessToken, response.user)
      return response
    } catch (e) {
      const mapped = normalizeError(e)
      error.value = mapped.status === 401 ? 'Invalid email or password' : mapped.message
      throw mapped
    } finally {
      loading.value = false
    }
  }

  const loadMe = async () => {
    if (!token.value) return null
    loading.value = true
    error.value = null
    try {
      const me = await accessApi.me()
      setSession(token.value, me)
      return me
    } catch (e) {
      clearSession()
      throw normalizeError(e)
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    clearSession()
  }

  return {
    token,
    user,
    loading,
    error,
    isAuthenticated,
    roles,
    isClient,
    isFreelancer,
    hasRole,
    signUp,
    login,
    loadMe,
    logout,
    setSession,
    clearSession,
    hydrateSession
  }
})
