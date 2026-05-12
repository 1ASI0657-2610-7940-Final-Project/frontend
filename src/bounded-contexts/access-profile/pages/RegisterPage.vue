<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../../app/stores/authStore'
import type { ErrorResponse } from '@shared/types/common.types'
import giguLogo from '@shared/assets/brand/GigU_Typo.png'
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

    <main class="right-panel">
      <div class="form-shell">
        <img class="brand" :src="giguLogo" alt="GigU" />
        <h1>Create your account</h1>
        <p class="subtitle">Join our network of ambitious students and innovative companies.</p>

        <p class="role-label">I want to join GigU as a...</p>
        <div class="role-grid">
          <button type="button" class="role-card" :class="{ active: form.role === 'FREELANCER' }" @click="form.role = 'FREELANCER'">
            <strong>Freelancer</strong>
            <span>Find projects and build your resume.</span>
          </button>
          <button type="button" class="role-card" :class="{ active: form.role === 'CLIENT' }" @click="form.role = 'CLIENT'">
            <strong>Client</strong>
            <span>Hire top-tier university talent.</span>
          </button>
        </div>

        <form class="form" @submit.prevent="submit">
          <div class="two-col">
            <label>
              <span>First Name</span>
              <input v-model="form.firstName" placeholder="e.g. Jane" />
              <small v-if="fieldErrors.firstName" class="error">{{ fieldErrors.firstName }}</small>
            </label>

            <label>
              <span>Last Name</span>
              <input v-model="form.lastName" placeholder="e.g. Doe" />
              <small v-if="fieldErrors.lastName" class="error">{{ fieldErrors.lastName }}</small>
            </label>
          </div>

          <label>
            <span>University Email Address</span>
            <input v-model="form.email" type="email" placeholder="student@university.edu" />
            <small v-if="fieldErrors.email" class="error">{{ fieldErrors.email }}</small>
          </label>

          <label>
            <span>Password</span>
            <input v-model="form.password" type="password" placeholder="........" />
            <small class="muted">Must be at least 8 characters long.</small>
            <small v-if="fieldErrors.password" class="error">{{ fieldErrors.password }}</small>
          </label>

          <p v-if="generalError" class="error">{{ generalError }}</p>

          <button class="primary" :disabled="!canSubmit">{{ auth.loading ? 'Creating...' : 'Create Account' }}</button>
        </form>

        <p class="signin">Already have an account? <RouterLink to="/login">Log in</RouterLink></p>
      </div>
    </main>
  </section>
</template>

<style scoped>
.register-wrap { min-height: 100vh; display: grid; grid-template-columns: 56% 44%; background: #f4f5fc; }
.left-panel {
  position: relative;
  overflow: hidden;
}
.hero-image { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(13, 23, 42, 0.2), rgba(13, 23, 42, 0.55)); }
.left-content {
  position: absolute;
  left: 3rem;
  right: 3rem;
  bottom: 3rem;
  color: #fff;
  z-index: 1;
}
.left-content h2 { color: #fff; font-size: 4rem; line-height: 1.1; margin-bottom: 0.75rem; }
.left-content p { margin: 0; font-size: 2.05rem; line-height: 1.45; color: rgba(255, 255, 255, 0.92); }

.right-panel { display: grid; place-items: center; padding: 2rem; }
.form-shell { width: min(560px, 100%); }
.brand { height: 56px; width: auto; display: block; margin-bottom: 0.55rem; }
h1 {
  font-family: var(--font-headline);
  font-size: 3.5rem;
  line-height: 1.16;
  letter-spacing: -0.02em;
  margin-bottom: 0.45rem;
}
.subtitle {
  margin: 0 0 1.25rem;
  color: var(--color-text-muted);
  font-family: var(--font-body);
  font-size: 1.1rem;
  line-height: 1.55;
}
.role-label {
  margin: 0 0 0.5rem;
  color: #334155;
  font-family: var(--font-label);
  font-size: 0.95rem;
  line-height: 1.4;
}
.role-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem; }
.role-card {
  border: 1px solid #b8c4d7;
  border-radius: 12px;
  background: #fff;
  text-align: left;
  padding: 0.95rem 1rem;
  display: grid;
  gap: 0.3rem;
  cursor: pointer;
}
.role-card.active { border-color: var(--color-primary); box-shadow: 0 0 0 2px rgba(10, 102, 194, 0.12) inset; background: #f8fbff; }
.role-card strong { font-family: var(--font-headline); font-size: 1.1rem; line-height: 1.3; }
.role-card span { color: #475569; font-family: var(--font-body); font-size: 1rem; line-height: 1.5; }

.form { display: grid; gap: 0.75rem; }
.two-col { display: grid; gap: 0.75rem; grid-template-columns: 1fr 1fr; }
label { display: grid; gap: 0.35rem; }
label span {
  font-family: var(--font-label);
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.4;
}
input {
  width: 100%;
  border: 1px solid #bfc8db;
  border-radius: 10px;
  padding: 0.75rem 0.85rem;
  outline: none;
  background: #fff;
  font-family: var(--font-body);
  font-size: 1rem;
  line-height: 1.45;
}
input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 2px rgba(10, 102, 194, 0.14); }
.muted {
  color: var(--color-text-muted);
  font-family: var(--font-body);
  font-size: 0.95rem;
  line-height: 1.4;
}
.error { color: var(--color-error); margin: 0; }
.primary {
  margin-top: 0.5rem;
  border: none;
  border-radius: 10px;
  background: var(--color-primary);
  color: #fff;
  font-family: var(--font-label);
  font-size: 1.02rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  padding: 0.78rem 1rem;
  cursor: pointer;
}
.primary:disabled { opacity: 0.65; cursor: not-allowed; }
.signin {
  margin: 1rem 0 0;
  text-align: center;
  color: #475569;
  font-family: var(--font-body);
  font-size: 1rem;
}
.signin a { color: var(--color-primary); font-weight: 600; }

@media (max-width: 1140px) {
  .register-wrap { grid-template-columns: 1fr; }
  .left-panel { min-height: 240px; }
  .left-content { left: 1.5rem; right: 1.5rem; bottom: 1.5rem; }
  .left-content h2 { font-size: 2.3rem; }
  .left-content p { font-size: 1.2rem; }
}
@media (max-width: 760px) {
  .right-panel { padding: 1.2rem; }
  .two-col, .role-grid { grid-template-columns: 1fr; }
  h1 { font-size: 2.2rem; }
  .subtitle { font-size: 1rem; }
}
</style>
