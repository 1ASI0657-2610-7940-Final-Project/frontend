<script setup lang="ts">
defineProps<{ modelValue: string; label?: string; placeholder?: string; rows?: number; error?: string }>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <label class="field">
    <span v-if="label">{{ label }}</span>
    <textarea :rows="rows ?? 4" :value="modelValue" :placeholder="placeholder" @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)" />
    <small v-if="error" class="error">{{ error }}</small>
  </label>
</template>

<style scoped>
.field { display: grid; gap: 0.35rem; font-weight: 600; }
textarea { border: 1px solid var(--color-border); border-radius: 10px; padding: 0.7rem 0.8rem; resize: vertical; }
.error { color: var(--color-error); }
</style>
