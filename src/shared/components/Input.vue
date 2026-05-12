<script setup lang="ts">
defineProps<{ modelValue: string; label?: string; type?: string; error?: string; placeholder?: string }>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <label class="field">
    <span v-if="label">{{ label }}</span>
    <input :type="type ?? 'text'" :value="modelValue" :placeholder="placeholder" @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)" :class="{ invalid: error }" />
    <small v-if="error" class="error">{{ error }}</small>
  </label>
</template>

<style scoped>
.field { display: grid; gap: 0.35rem; font-weight: 600; }
input { border: 1px solid var(--color-border); border-radius: 10px; padding: 0.7rem 0.8rem; }
.invalid { border-color: var(--color-error); }
.error { color: var(--color-error); }
</style>
