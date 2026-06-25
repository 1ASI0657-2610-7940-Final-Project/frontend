import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const user = ref<{ id: string; email?: string; role?: 'CLIENT' | 'FREELANCER'; avatarUrl?: string } | null>(null)
  const isAuthenticated = computed(() => Boolean(token.value))

  const logout = () => {
    token.value = null
    user.value = null
  }

  return {
    token,
    user,
    isAuthenticated,
    logout
  }
})
