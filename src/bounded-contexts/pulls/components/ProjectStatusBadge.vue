<script setup lang="ts">
import { computed } from 'vue'
import type { ProjectStatus } from '@pulls/types/engagement.types'

const props = defineProps<{ status: ProjectStatus }>()
const tone = computed(() => {
  if (props.status === 'IN_PROGRESS') return 'progress'
  if (props.status === 'FINISHED') return 'finished'
  if (props.status === 'DELIVERED') return 'delivered'
  if (props.status === 'CANCELLED') return 'cancelled'
  return 'pending'
})
</script>

<template><span class="badge" :class="tone">{{ status }}</span></template>

<style scoped>
.badge { border-radius: 999px; padding: 4px 10px; font-size: 12px; font-weight: 700; border: 1px solid; }
.pending { background: #eef5ff; color: #0a66c2; border-color: #c9dbf7; }
.progress { background: #e8f2ff; color: #0a66c2; border-color: #b8d6f8; }
.delivered { background: #fff7e8; color: #b45309; border-color: #f7dfb3; }
.finished { background: #e9f8ef; color: #15803d; border-color: #b7ebc8; }
.cancelled { background: #fff1f1; color: #b42318; border-color: #f8cccc; }
</style>
