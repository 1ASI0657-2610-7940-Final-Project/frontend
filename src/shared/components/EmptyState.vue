<script setup lang="ts">
defineProps<{ title: string; message: string; actionLabel?: string }>()
defineEmits<{ action: [] }>()
</script>

<template>
  <div class="card state">
    <div class="icon-wrap">
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
        <line x1="11" y1="8" x2="11" y2="14"/>
        <line x1="8" y1="11" x2="14" y2="11"/>
      </svg>
    </div>
    <h3>{{ title }}</h3>
    <p class="muted">{{ message }}</p>
    <button v-if="actionLabel" class="btn-action" @click="$emit('action')">{{ actionLabel }}</button>
  </div>
</template>

<style scoped>
.state { text-align: center; padding: 3rem 2rem; display: flex; flex-direction: column; align-items: center; gap: 0.65rem; }
.icon-wrap { width: 60px; height: 60px; border-radius: 50%; background: #eef2ff; display: flex; align-items: center; justify-content: center; color: #6b7280; margin-bottom: 0.25rem; }
h3 { margin: 0; font-size: 1.05rem; font-weight: 600; }
p { margin: 0; font-size: 0.875rem; max-width: 340px; }
.btn-action { margin-top: 0.5rem; border: none; border-radius: 8px; padding: 0.6rem 1.5rem; background: var(--color-primary); color: #fff; font-weight: 700; cursor: pointer; font-size: 0.875rem; }
</style>
