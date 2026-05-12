<script setup lang="ts">
import type { ProjectStatusHistoryItem } from '@pulls/types/engagement.types'
import { formatDate } from '../../../shared/utils/formatDate'

defineProps<{ history: ProjectStatusHistoryItem[] }>()
</script>

<template>
  <div class="card timeline">
    <h3>Project Timeline</h3>
    <div class="item" v-for="entry in history" :key="`${entry.status}-${entry.changedAt}`">
      <div class="dot" />
      <div>
        <strong>{{ entry.status }}</strong>
        <div class="muted">{{ formatDate(entry.changedAt) }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timeline { padding: 1rem; display: grid; gap: 0.85rem; }
.item { display: grid; grid-template-columns: 12px 1fr; gap: 0.7rem; align-items: start; }
.dot { width: 12px; height: 12px; border-radius: 999px; background: var(--color-primary); margin-top: 4px; }
</style>
