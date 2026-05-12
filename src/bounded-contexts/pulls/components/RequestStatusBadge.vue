<script setup lang="ts">
import { computed } from 'vue'
import type { RequestStatus } from '@pulls/types/engagement.types'

const props = defineProps<{ status: RequestStatus }>()
const tone = computed(() => (props.status === 'PENDING' ? 'pending' : props.status === 'ACCEPTED' ? 'accepted' : 'rejected'))
</script>

<template><span class="badge" :class="tone">{{ status }}</span></template>

<style scoped>
.badge { border-radius: 999px; padding: 4px 10px; font-size: 12px; font-weight: 700; border: 1px solid; }
.pending { background: #eef5ff; color: #0a66c2; border-color: #c9dbf7; }
.accepted { background: #e9f8ef; color: #15803d; border-color: #b7ebc8; }
.rejected { background: #fff1f1; color: #b42318; border-color: #f8cccc; }
</style>
