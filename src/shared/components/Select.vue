<script setup lang="ts">
defineProps<{ modelValue: string; label?: string; options: Array<{ label: string; value: string }>; error?: string }>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <label class="field">
    <span v-if="label">{{ label }}</span>
    <select :value="modelValue" @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)">
      <option value="" disabled>Select</option>
      <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
    </select>
    <small v-if="error" class="error">{{ error }}</small>
  </label>
</template>

<style scoped>
.field { display: grid; gap: 0.35rem; font-weight: 600; }
select { border: 1px solid var(--color-border); border-radius: 10px; padding: 0.7rem 0.8rem; background: white; }
.error { color: var(--color-error); }
</style>
