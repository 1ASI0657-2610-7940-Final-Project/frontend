<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../../app/stores/authStore'
import type { ErrorResponse } from '@shared/types/common.types'
import giguLogo from '@shared/assets/brand/GigU_Typo.png'

const router = useRouter()
const auth = useAuthStore()

const form = reactive({ email: '', password: '' })
const fieldErrors = ref<Record<string, string>>({})
const generalError = ref('')

const canSubmit = computed(() => form.email.trim().length > 0 && form.password.trim().length > 0 && !auth.loading)

const submit = async () => {
  fieldErrors.value = {}
  generalError.value = ''
  try {
    const response = await auth.login({ email: form.email.trim(), password: form.password })
    const roles = response.user.roles ?? []
    if (roles.includes('FREELANCER')) {
      await router.push('/freelancer/dashboard')
      return
    }
    if (roles.includes('CLIENT')) {
      await router.push('/client/dashboard')
      return
    }
    await router.push('/marketplace')
  } catch (error) {
    const mapped = error as ErrorResponse
    generalError.value = mapped.status === 401 ? 'Invalid email or password' : mapped.message
    fieldErrors.value = mapped.fields ?? {}
  }
}
</script>

<template>
  <section class="login-wrap">
    <div class="login-card">
      <header>
        <img class="brand" :src="giguLogo" alt="GigU" />
        <h2>Welcome back</h2>
        <p class="muted">Please enter your credentials to access your account.</p>
      </header>

      <form class="form" @submit.prevent="submit">
        <label>
          <span>Email</span>
          <input v-model="form.email" type="email" placeholder="name@university.edu" />
          <small v-if="fieldErrors.email" class="error">{{ fieldErrors.email }}</small>
        </label>

        <label>
          <div class="password-row">
            <span>Password</span>
            <button type="button" class="forgot">Forgot password?</button>
          </div>
          <input v-model="form.password" type="password" placeholder="Enter your password" />
          <small v-if="fieldErrors.password" class="error">{{ fieldErrors.password }}</small>
        </label>

        <p v-if="generalError" class="error">{{ generalError }}</p>

        <button class="primary" :disabled="!canSubmit">{{ auth.loading ? 'Signing in...' : 'Sign In' }}</button>
      </form>

      <footer>
        <p>Don't have an account? <RouterLink to="/register">Register</RouterLink></p>
        <RouterLink to="/marketplace">Browse marketplace</RouterLink>
      </footer>
    </div>
  </section>
</template>

<style scoped>
.login-wrap {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1.25rem;
}

.login-card {
  width: min(480px, 100%);
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: 2.25rem 2rem;
}

header {
  text-align: center;
  margin-bottom: 1.25rem;
}

.brand { width: auto; height: 54px; margin-bottom: 0.25rem; }

h2 {
  font-size: 2rem;
  margin-bottom: 0.375rem;
}

.muted {
  color: var(--color-text-muted);
  margin: 0;
}

.form {
  display: grid;
  gap: 0.95rem;
}

label {
  display: grid;
  gap: 0.35rem;
}

.password-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

span {
  font-family: var(--font-label);
  font-weight: 600;
  font-size: 0.95rem;
}

.forgot {
  border: none;
  background: transparent;
  color: var(--color-primary);
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

input {
  width: 100%;
  border: 1px solid #bfc8db;
  border-radius: 10px;
  padding: 0.75rem 0.85rem;
  outline: none;
}

input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(10, 102, 194, 0.14);
}

.primary {
  margin-top: 0.25rem;
  border: none;
  border-radius: 10px;
  padding: 0.78rem 0.9rem;
  background: var(--color-primary);
  color: var(--color-white);
  font-weight: 700;
  cursor: pointer;
}

.primary:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.error {
  color: var(--color-error);
  margin: 0;
}

footer {
  margin-top: 1.25rem;
  border-top: 1px solid var(--color-border);
  padding-top: 1rem;
  display: grid;
  justify-items: center;
  gap: 0.4rem;
  color: var(--color-text-muted);
}

footer p {
  margin: 0;
}

footer a {
  color: var(--color-primary);
  font-weight: 600;
}
</style>
