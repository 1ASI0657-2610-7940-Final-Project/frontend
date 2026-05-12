<script setup lang="ts">
defineProps<{ label?: string; accept?: string; multiple?: boolean }>()
defineEmits<{ change: [files: FileList | null] }>()
</script>

<template>
  <label class="upload card">
    <span>{{ label ?? 'Drag and drop files or click to browse' }}</span>
    <input type="file" :accept="accept" :multiple="multiple" @change="$emit('change', ($event.target as HTMLInputElement).files)" />
  </label>
</template>

<style scoped>
.upload { display: grid; place-items: center; min-height: 140px; border-style: dashed; color: var(--color-text-muted); cursor: pointer; }
input { display: none; }
</style>
