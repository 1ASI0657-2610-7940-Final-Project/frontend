<script setup lang="ts">
withDefaults(defineProps<{ tone?: 'neutral' | 'success' | 'warning' | 'error' | 'info' }>(), { tone: 'neutral' })
</script>

<template>
  <span class="badge" :class="tone"><slot /></span>
</template>

<style scoped>
.badge { display: inline-flex; align-items: center; border-radius: 999px; padding: 0.22rem 0.7rem; font-size: 0.85rem; font-weight: 700; }
.neutral { background: #f1f5f9; color: #334155; }
.success { background: #e8f7ed; color: var(--color-success); }
.warning { background: #fff6e8; color: var(--color-warning); }
.error { background: #fdecec; color: var(--color-error); }
.info { background: #eaf2ff; color: var(--color-primary); }
</style>
