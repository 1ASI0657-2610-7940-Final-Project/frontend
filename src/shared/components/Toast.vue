<script setup lang="ts">
defineProps<{ message: string; type?: 'success' | 'warning' | 'error' | 'info' }>()
</script>

<template>
  <div class="toast" :class="type ?? 'info'">{{ message }}</div>
</template>

<style scoped>
.toast { padding: 0.75rem 1rem; border-radius: 10px; font-weight: 600; }
.info { background: var(--color-tertiary); color: var(--color-primary); }
.success { background: #eaf9ef; color: var(--color-success); }
.warning { background: #fff6eb; color: var(--color-warning); }
.error { background: #feecec; color: var(--color-error); }
</style>
