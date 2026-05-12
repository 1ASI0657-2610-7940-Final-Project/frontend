<script setup lang="ts">
import { useAuthStore } from '../../../app/stores/authStore'

const auth = useAuthStore()
</script>

<template>
  <section class="card dash">
    <h1 class="page-title">Client Dashboard</h1>
    <p class="muted">Authenticated as CLIENT.</p>
    <div class="info">
      <p><strong>User ID:</strong> {{ auth.user?.id }}</p>
      <p><strong>Email:</strong> {{ auth.user?.email }}</p>
      <p><strong>Roles:</strong> {{ auth.roles.join(', ') }}</p>
    </div>
    <button class="logout" @click="auth.logout()">Logout</button>
  </section>
</template>

<style scoped>
.dash { padding: 1.5rem; max-width: 720px; }
.info { margin: 1rem 0; display: grid; gap: 0.35rem; }
.logout { border: none; border-radius: 8px; background: #0a66c2; color: #fff; font-weight: 700; padding: 0.55rem 0.9rem; }
</style>
