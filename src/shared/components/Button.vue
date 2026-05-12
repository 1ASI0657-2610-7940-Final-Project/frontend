<script setup lang="ts">
withDefaults(defineProps<{ variant?: 'primary' | 'secondary' | 'ghost'; type?: 'button' | 'submit' | 'reset'; disabled?: boolean }>(), {
  variant: 'primary',
  type: 'button',
  disabled: false
})
</script>

<template>
  <button :type="type" class="btn" :class="variant" :disabled="disabled"><slot /></button>
</template>

<style scoped>
.btn { border-radius: 10px; border: 1px solid transparent; padding: 0.7rem 1rem; font-weight: 700; cursor: pointer; }
.primary { background: var(--color-primary); color: white; }
.secondary { background: white; border-color: var(--color-primary); color: var(--color-primary); }
.ghost { background: transparent; color: var(--color-primary); }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
