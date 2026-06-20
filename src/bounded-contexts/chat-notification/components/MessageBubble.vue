<script setup lang="ts">
import { computed } from 'vue'
import type { ChatMessage } from '@chat/types/chat.types'
import { getParticipantMeta } from '@chat/utils/chatHelpers'
import { useChatStore } from '@chat/stores/chatStore'

const props = defineProps<{ 
  message: ChatMessage
  own: boolean
  showAvatar: boolean
  showTimestamp: boolean
}>()

const chatStore = useChatStore()

const senderName = computed(() => {
  if (props.own) return 'Me'
  const activeConv = chatStore.selectedConversation
  if (activeConv) {
    const participant = activeConv.participants.find(p => p.id === props.message.senderId)
    if (participant) return participant.displayName
  }
  const nameMap: Record<string, string> = {
    'sarah': 'Sarah Jenkins',
    'mark': 'Mark Davis',
    'alex': 'Alex Chen - TechNova',
    'emily': 'Emily Wong'
  }
  return nameMap[props.message.senderId] || 'Other'
})

const avatarMeta = computed(() => {
  return getParticipantMeta(senderName.value)
})

const formatBubbleTime = (sentAt: string) => {
  const d = new Date(sentAt)
  if (isNaN(d.getTime())) return sentAt
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
}
</script>

<template>
  <div class="row" :class="{ own }">
    <!-- Left side avatar (for received messages) -->
    <div v-if="!own" class="avatar-col">
      <template v-if="showAvatar">
        <img v-if="avatarMeta.avatar" :src="avatarMeta.avatar" class="bubble-avatar" alt="Avatar" />
        <div v-else class="bubble-avatar placeholder">{{ avatarMeta.initials }}</div>
      </template>
      <div v-else class="bubble-avatar-spacer"></div>
    </div>

    <!-- Bubble content and timestamp wrapper -->
    <div class="content-col" :class="{ own }">
      <article class="bubble" :class="{ own }">
        <p>{{ message.content }}</p>
      </article>
      <span v-if="showTimestamp" class="time" :class="{ own }">{{ formatBubbleTime(message.sentAt) }}</span>
    </div>
  </div>
</template>

<style scoped>
.row { display: flex; gap: 0.5rem; max-width: 80%; align-items: flex-end; margin-bottom: 0.15rem; }
.row.own { justify-content: flex-end; margin-left: auto; max-width: 72%; }

/* Avatar Col */
.avatar-col {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bubble-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}
.bubble-avatar.placeholder {
  background: #94a3b8;
  color: #fff;
  font-weight: 700;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bubble-avatar-spacer {
  width: 28px;
  height: 28px;
}

/* Content Col */
.content-col {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.content-col.own {
  align-items: flex-end;
}

/* Bubble Styles */
.bubble { 
  border: 1px solid #e2e8f0; 
  background: #f1f5f9; 
  border-radius: 12px; 
  padding: 0.65rem 0.85rem; 
  color: #0f172a;
  font-size: 0.875rem;
  line-height: 1.4;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}
.bubble.own { 
  background: #0b66c2; 
  color: #fff; 
  border-color: #0b66c2; 
}
p { margin: 0; white-space: pre-wrap; word-break: break-word; }

/* Time */
.time { 
  display: block; 
  font-size: 0.6875rem; 
  color: #64748b; 
  margin-top: 0.1rem;
}
.time.own {
  text-align: right;
  margin-right: 0.25rem;
}
</style>
