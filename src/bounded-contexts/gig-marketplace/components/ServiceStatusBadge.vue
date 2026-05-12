<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ status: string }>()
const tone = computed(() => {
  if (props.status === 'PUBLISHED') return 'success'
  if (props.status === 'DRAFT') return 'warning'
  if (props.status === 'ARCHIVED') return 'neutral'
  return 'neutral'
})
</script>

<template>
  <span class="status" :class="tone">{{ status }}</span>
</template>

<style scoped>
.status { border-radius: 999px; font-weight: 700; font-size: 12px; padding: 4px 10px; border: 1px solid; text-transform: capitalize; }
.success { color: #0a66c2; background: #e9f2fd; border-color: #b8d5f6; }
.warning { color: #b45309; background: #fff5e6; border-color: #fde6b6; }
.neutral { color: #475569; background: #f1f5f9; border-color: #dbe3ee; }
</style>
