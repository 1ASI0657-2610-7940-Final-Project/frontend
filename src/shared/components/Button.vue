<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}>()
</script>

<template>
  <button :class="['app-btn', variant || 'primary']" :disabled="disabled">
    <slot />
  </button>
</template>

<style scoped>
.app-btn {
  border-radius: 10px;
  padding: 0.7rem 1rem;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
}
.primary {
  background: var(--color-primary);
  color: #fff;
}
.secondary {
  background: #fff;
  border-color: var(--color-border);
  color: #0f172a;
}
.app-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
