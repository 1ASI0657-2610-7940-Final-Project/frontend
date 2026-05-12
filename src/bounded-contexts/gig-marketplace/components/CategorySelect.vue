<script setup lang="ts">
withDefaults(defineProps<{ modelValue: string; options: Array<{ id: string; name: string }>; label?: string }>(), { label: 'Category' })
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <label class="field">
    <span>{{ label }}</span>
    <select :value="modelValue" @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)">
      <option value="">All categories</option>
      <option v-for="category in options" :key="category.id" :value="category.name">{{ category.name }}</option>
    </select>
  </label>
</template>

<style scoped>
.field { display: grid; gap: 0.35rem; }
span { font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 700; }
select { border: 1px solid var(--color-border); border-radius: 10px; padding: 0.65rem 0.75rem; }
</style>
