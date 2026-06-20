<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../../app/stores/authStore'
import type { ErrorResponse } from '@shared/types/common.types'
import registerHero from '@shared/assets/brand/Background Image.png'

const router = useRouter()
const auth = useAuthStore()

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'FREELANCER' as 'CLIENT' | 'FREELANCER'
})

const fieldErrors = ref<Record<string, string>>({})
const generalError = ref('')

const canSubmit = computed(() => {
  return form.firstName.trim() && form.lastName.trim() && form.email.trim() && form.password.trim() && !auth.loading
})

const submit = async () => {
  generalError.value = ''
  fieldErrors.value = {}
  try {
    await auth.signUp({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role
    })
    await router.push('/login')
  } catch (error) {
    const mapped = error as ErrorResponse
    generalError.value = mapped.status === 409 ? 'Email already registered. Please use another email.' : mapped.message
    fieldErrors.value = mapped.fields ?? {}
  }
}
</script>

<template>
  <section class="register-wrap">
    <!-- LEFT PANEL -->
    <aside class="left-panel">
      <img class="hero-image" :src="registerHero" alt="GigU" />
      <div class="overlay"></div>
      <div class="left-content">
        <h2>Elevate your potential.</h2>
        <p>
          Connect with high-growth startups and build a professional portfolio while you study.
          The premier platform bridging academic talent with enterprise innovation.
        </p>
      </div>
    </aside>

    <!-- RIGHT PANEL -->
    <main class="right-panel">
      <div class="form-shell">
        <div class="brand">GigU</div>
        <h1>Create your account</h1>
        <p class="subtitle">Join our network of ambitious students and innovative companies.</p>

        <!-- Role Selector -->
        <div class="form-group-role">
          <p class="role-label">I want to join GigU as a...</p>
          <div class="role-grid">
            
            <!-- Freelancer Card -->
            <button 
              type="button" 
              class="role-card" 
              :class="{ active: form.role === 'FREELANCER' }" 
              @click="form.role = 'FREELANCER'"
            >
              <div class="card-top">
                <div class="card-icon-title">
                  <svg class="role-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
                  </svg>
                  <span class="role-title">Freelancer</span>
                </div>
                <div class="checked-circle" v-if="form.role === 'FREELANCER'">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              </div>
              <p class="role-desc">Find projects and build your resume.</p>
            </button>

            <!-- Client Card -->
            <button 
              type="button" 
              class="role-card" 
              :class="{ active: form.role === 'CLIENT' }" 
              @click="form.role = 'CLIENT'"
            >
              <div class="card-top">
                <div class="card-icon-title">
                  <svg class="role-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
                    <line x1="9" y1="22" x2="9" y2="16"/>
                    <line x1="15" y1="22" x2="15" y2="16"/>
                    <path d="M9 16h6M8 6h.01M16 6h.01M8 10h.01M16 10h.01M12 6h.01M12 10h.01"/>
                  </svg>
                  <span class="role-title">Client</span>
                </div>
                <div class="checked-circle" v-if="form.role === 'CLIENT'">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              </div>
              <p class="role-desc">Hire top-tier university talent.</p>
            </button>

          </div>
        </div>

        <!-- FORM -->
        <form class="form" @submit.prevent="submit">
          <!-- First & Last Name -->
          <div class="two-col">
            <label class="form-label">
              <span class="field-title">First Name</span>
              <input 
                v-model="form.firstName" 
                placeholder="e.g. Jane" 
                class="input-field"
                :class="{ 'error-border': fieldErrors.firstName }"
              />
              <small v-if="fieldErrors.firstName" class="error-msg">{{ fieldErrors.firstName }}</small>
            </label>

            <label class="form-label">
              <span class="field-title">Last Name</span>
              <input 
                v-model="form.lastName" 
                placeholder="e.g. Doe" 
                class="input-field"
                :class="{ 'error-border': fieldErrors.lastName }"
              />
              <small v-if="fieldErrors.lastName" class="error-msg">{{ fieldErrors.lastName }}</small>
            </label>
          </div>

          <!-- Email -->
          <label class="form-label">
            <span class="field-title">University Email Address</span>
            <input 
              v-model="form.email" 
              type="email" 
              placeholder="student@university.edu" 
              class="input-field"
              :class="{ 'error-border': fieldErrors.email }"
            />
            <small v-if="fieldErrors.email" class="error-msg">{{ fieldErrors.email }}</small>
          </label>

          <!-- Password -->
          <label class="form-label">
            <span class="field-title">Password</span>
            <input 
              v-model="form.password" 
              type="password" 
              placeholder="........" 
              class="input-field"
              :class="{ 'error-border': fieldErrors.password }"
            />
            <span class="helper-text">Must be at least 8 characters long.</span>
            <small v-if="fieldErrors.password" class="error-msg">{{ fieldErrors.password }}</small>
          </label>

          <!-- General Error -->
          <p v-if="generalError" class="error-msg general">{{ generalError }}</p>

          <button class="primary" :disabled="!canSubmit">
            {{ auth.loading ? 'Creating Account...' : 'Create Account' }}
          </button>
        </form>

        <p class="signin">Already have an account? <RouterLink to="/login" class="login-link">Log in</RouterLink></p>
      </div>
    </main>
  </section>
</template>

<style scoped>
.register-wrap {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 50% 50%;
  background: #ffffff;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  box-sizing: border-box;
}

/* LEFT PANEL */
.left-panel {
  position: relative;
  overflow: hidden;
}
.hero-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(13, 23, 42, 0.25), rgba(13, 23, 42, 0.7));
}
.left-content {
  position: absolute;
  left: 4.5rem;
  right: 4.5rem;
  bottom: 4.5rem;
  color: white;
  z-index: 2;
}
.left-content h2 {
  color: #ffffff;
  font-family: Georgia, Cambria, 'Times New Roman', serif;
  font-size: 2.85rem;
  font-weight: 700;
  line-height: 1.15;
  margin: 0 0 1rem 0;
  letter-spacing: -0.02em;
}
.left-content p {
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.9);
}

/* RIGHT PANEL */
.right-panel {
  display: grid;
  place-items: center;
  padding: 3rem 2.5rem;
  background: #f8faff; /* Matching soft purplish background */
  overflow-y: auto;
}
.form-shell {
  width: min(480px, 100%);
}

.brand {
  font-size: 2.75rem;
  font-weight: 800;
  color: #0b57d0; /* GigU Blue logo matching login */
  letter-spacing: -0.03em;
  margin-bottom: 0.5rem;
}

h1 {
  font-size: 1.85rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0.5rem 0 0.25rem 0;
  letter-spacing: -0.02em;
}

.subtitle {
  margin: 0 0 1.75rem 0;
  color: #475569;
  font-size: 0.95rem;
  line-height: 1.5;
}

.form-group-role {
  margin-bottom: 1.25rem;
}

.role-label {
  margin: 0 0 0.5rem 0;
  color: #64748b;
  font-weight: 600;
  font-size: 0.8rem;
}

.role-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
}

.role-card {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  text-align: left;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  cursor: pointer;
  outline: none;
  box-sizing: border-box;
  transition: all 0.2s ease;
}

.role-card.active {
  border-color: #0b57d0;
  border-width: 1.5px;
  background: #eff6ff;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.card-icon-title {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.role-icon {
  color: #0b57d0;
}

.role-title {
  font-weight: 700;
  font-size: 0.925rem;
  color: #0f172a;
}

.checked-circle {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #0b57d0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.role-desc {
  color: #64748b;
  font-size: 0.8rem;
  margin: 0;
  line-height: 1.4;
}

.form {
  display: grid;
  gap: 1.1rem;
}

.two-col {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr 1fr;
}

.form-label {
  display: grid;
  gap: 0.35rem;
}

.field-title {
  font-size: 0.825rem;
  font-weight: 700;
  color: #334155;
}

.input-field {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0.75rem 0.85rem;
  outline: none;
  font-size: 0.925rem;
  font-family: inherit;
  color: #0f172a;
  background: #ffffff;
  box-sizing: border-box;
  transition: all 0.2s ease;
}

.input-field:focus {
  border-color: #0b57d0;
  box-shadow: 0 0 0 2px rgba(11, 87, 208, 0.1);
}

.input-field.error-border {
  border-color: #ef4444;
}

.input-field.error-border:focus {
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1);
}

.helper-text {
  color: #64748b;
  font-size: 0.78rem;
  margin-top: 0.1rem;
}

.error-msg {
  color: #dc2626;
  font-size: 0.825rem;
  margin-top: 0.15rem;
  font-weight: 500;
}

.error-msg.general {
  margin-top: 0;
}

.primary {
  width: 100%;
  border: none;
  border-radius: 8px;
  padding: 0.85rem;
  background: #0b57d0;
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

.signin {
  margin: 1.5rem 0 0 0;
  text-align: center;
  color: #64748b;
  font-size: 0.875rem;
}

.login-link {
  color: #0b57d0;
  font-weight: 700;
  text-decoration: none;
}

.login-link:hover {
  text-decoration: underline;
}

/* RESPONSIVE DESIGN */
@media (max-width: 1140px) {
  .register-wrap {
    grid-template-columns: 1fr;
  }
  .left-panel {
    display: none; /* Hide left hero on smaller screens like standard signup flows */
  }
  .right-panel {
    padding: 3rem 1.5rem;
  }
}
@media (max-width: 480px) {
  .two-col {
    grid-template-columns: 1fr;
    gap: 1.1rem;
  }
  .role-grid {
    grid-template-columns: 1fr;
  }
}
</style>
