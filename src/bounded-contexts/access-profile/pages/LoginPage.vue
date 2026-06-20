<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../../app/stores/authStore'
import type { ErrorResponse } from '@shared/types/common.types'

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
    generalError.value = mapped.status === 401 
      ? 'The password you entered is incorrect. Please try again or reset your password.' 
      : mapped.message
    fieldErrors.value = mapped.fields ?? {}
  }
}
</script>

<template>
  <section class="login-wrap">
    <div class="login-card">
      <header>
        <div class="brand">GigU</div>
        <h2>Welcome back</h2>
        <p class="muted">Please enter your credentials to access your account.</p>
      </header>

      <form class="form" @submit.prevent="submit">
        <label class="form-label">
          <span class="field-title">Email</span>
          <input 
            v-model="form.email" 
            type="email" 
            placeholder="name@university.edu" 
            class="input-field"
            :class="{ 'error-border': fieldErrors.email }"
          />
          <small v-if="fieldErrors.email" class="error-msg">{{ fieldErrors.email }}</small>
        </label>

        <label class="form-label">
          <div class="password-row">
            <span class="field-title">Password</span>
            <button type="button" class="forgot">Forgot password?</button>
          </div>
          <input 
            v-model="form.password" 
            type="password" 
            placeholder="Enter your password" 
            class="input-field"
            :class="{ 'error-border': generalError || fieldErrors.password }"
          />
        </label>

        <!-- Red validation error message under the password field matching the screenshot -->
        <div v-if="generalError || fieldErrors.password" class="error-container">
          <div class="error-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          </div>
          <span class="error-text">
            {{ generalError || fieldErrors.password }}
          </span>
        </div>

        <button class="primary" :disabled="!canSubmit">
          {{ auth.loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <div class="divider"></div>

      <footer>
        <p class="footer-text">
          Don't have an account? 
          <RouterLink to="/register" class="register-link">Register</RouterLink>
        </p>
      </footer>
    </div>
  </section>
</template>

<style scoped>
.login-wrap {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background: #f8faff; /* Soft purplish-blue background matching the screenshot */
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  box-sizing: border-box;
}

.login-card {
  width: min(440px, 100%);
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  padding: 3.5rem 2.75rem;
  box-sizing: border-box;
}

header {
  text-align: center;
  margin-bottom: 2rem;
}

.brand {
  font-size: 2.75rem;
  font-weight: 800;
  color: #0b57d0; /* Rich blue color matching GigU logo in screenshot */
  letter-spacing: -0.03em;
  margin-bottom: 0.25rem;
}

h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0.5rem 0 0.25rem 0;
  letter-spacing: -0.02em;
}

.muted {
  color: #475569;
  font-size: 0.95rem;
  margin: 0.25rem 0 0 0;
  line-height: 1.5;
}

.form {
  display: grid;
  gap: 1.25rem;
}

.form-label {
  display: grid;
  gap: 0.35rem;
}

.field-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #334155;
}

.password-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.forgot {
  border: none;
  background: transparent;
  color: #0b57d0;
  font-weight: 700;
  font-size: 0.825rem;
  cursor: pointer;
  padding: 0;
}
.forgot:hover {
  text-decoration: underline;
}

.input-field {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0.75rem 0.85rem;
  outline: none;
  font-size: 0.95rem;
  font-family: inherit;
  color: #0f172a;
  box-sizing: border-box;
  transition: all 0.2s ease;
}

.input-field:focus {
  border-color: #0b57d0;
  box-shadow: 0 0 0 2px rgba(11, 87, 208, 0.1);
}

.input-field.error-border {
  border-color: #ef4444; /* Red border on input error */
}

.input-field.error-border:focus {
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1);
}

/* Red validation error message under the password field matching screenshot */
.error-container {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  color: #dc2626;
  font-size: 0.85rem;
  line-height: 1.4;
  margin-top: -0.25rem;
}
.error-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #dc2626;
  color: #ffffff;
  border-radius: 50%;
  width: 15px;
  height: 15px;
  flex-shrink: 0;
  margin-top: 0.1rem;
}
.error-icon svg {
  width: 10px;
  height: 10px;
  stroke: #ffffff;
  fill: #dc2626;
}
.error-text {
  font-weight: 500;
}

.error-msg {
  color: #dc2626;
  font-size: 0.825rem;
  margin-top: 0.15rem;
}

.primary {
  width: 100%;
  border: none;
  border-radius: 8px;
  padding: 0.85rem;
  background: #0b57d0; /* Royal blue matching the screenshot button */
  color: #ffffff;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s ease;
  margin-top: 0.25rem;
}

.primary:hover:not(:disabled) {
  background: #094cb4;
}

.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.divider {
  height: 1px;
  background: #cbd5e1;
  margin: 1.75rem 0;
}

.footer-text {
  text-align: center;
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

.register-link {
  color: #0b57d0;
  font-weight: 700;
  text-decoration: none;
}

.register-link:hover {
  text-decoration: underline;
}
</style>
