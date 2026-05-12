<script setup lang="ts">
import type { ConversationSummary } from '@chat/types/chat.types'
import { formatDate } from '../../../shared/utils/formatDate'

defineProps<{ conversations: ConversationSummary[]; selectedId?: string }>()
defineEmits<{ select: [id: string] }>()
</script>

<template>
  <aside class="list">
    <div class="title">Messaging</div>
    <button
      v-for="conversation in conversations"
      :key="conversation.id"
      class="item"
      :class="{ active: selectedId === conversation.id }"
      @click="$emit('select', conversation.id)"
    >
      <div class="top">
        <strong>{{ conversation.participants[0]?.displayName || 'Conversation' }}</strong>
        <span class="muted">{{ formatDate(conversation.lastMessageAt) }}</span>
      </div>
      <p>{{ conversation.lastMessage }}</p>
      <span v-if="conversation.unreadCount" class="unread">{{ conversation.unreadCount }}</span>
    </button>
  </aside>
</template>

<style scoped>
.list { border-right: 1px solid var(--color-border); background: #fff; }
.title { padding: 1rem; font-size: 2rem; font-family: var(--font-headline); }
.item { width: 100%; text-align: left; border: none; border-top: 1px solid var(--color-border); background: #fff; padding: 0.9rem; position: relative; }
.item.active { background: #edf3ff; border-left: 3px solid var(--color-primary); }
.top { display: flex; justify-content: space-between; gap: 0.5rem; }
p { margin: 0.45rem 0 0; color: #475569; }
.unread { position: absolute; right: 0.8rem; bottom: 0.8rem; background: var(--color-primary); color: #fff; border-radius: 999px; padding: 2px 8px; font-size: 12px; font-weight: 700; }
</style>
