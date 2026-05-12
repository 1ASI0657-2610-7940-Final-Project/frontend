<script setup lang="ts">
import type { ChatMessage } from '@chat/types/chat.types'
import { formatDate } from '../../../shared/utils/formatDate'

const props = defineProps<{ message: ChatMessage; own: boolean }>()
</script>

<template>
  <div class="row" :class="{ own }">
    <article class="bubble" :class="{ own }">
      <p>{{ message.content }}</p>
      <span class="time">{{ formatDate(message.sentAt) }}</span>
    </article>
  </div>
</template>

<style scoped>
.row { display: flex; }
.row.own { justify-content: flex-end; }
.bubble { max-width: 72%; border: 1px solid var(--color-border); background: #f5f8ff; border-radius: 14px; padding: 0.75rem; }
.bubble.own { background: #0a66c2; color: #fff; border-color: #0a66c2; }
p { margin: 0; }
.time { display: block; margin-top: 0.35rem; font-size: 12px; opacity: 0.85; }
</style>
