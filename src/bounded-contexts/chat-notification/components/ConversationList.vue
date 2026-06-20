<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ConversationSummary } from '@chat/types/chat.types'
import { getConversationCounterpart, getParticipantMeta } from '@chat/utils/chatHelpers'
import { useAuthStore } from '../../../app/stores/authStore'

const props = defineProps<{ conversations: ConversationSummary[]; selectedId?: string }>()
defineEmits<{ select: [id: string] }>()

const searchQuery = ref('')
const authStore = useAuthStore()

const getCounterpart = (conversation: ConversationSummary) =>
  getConversationCounterpart(conversation.participants, authStore.user?.id)

const formatConversationCode = (value?: string) => {
  const raw = value?.trim()
  if (!raw) return ''
  if (/^PRJ-\d+$/i.test(raw)) return raw.toUpperCase()
  const uuidLike = raw.replace(/-/g, '')
  if (/^[a-f0-9]{32}$/i.test(uuidLike)) {
    return uuidLike.slice(0, 8)
  }
  return raw.length > 12 ? raw.slice(0, 8) : raw
}

const formatConversationTitle = (conversation: ConversationSummary) => {
  const name = getCounterpart(conversation)?.displayName || 'Conversation'
  const code = formatConversationCode(conversation.projectId || conversation.id)
  return code ? `${name} - ${code}` : name
}

const formatMsgTime = (sentAt: string) => {
  const d = new Date(sentAt)
  if (isNaN(d.getTime())) {
    return sentAt
  }
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffDays === 0 && d.getDate() === now.getDate()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } else if (diffDays === 1 || (diffDays === 0 && d.getDate() !== now.getDate())) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return days[d.getDay()]
  } else {
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }
}

const filteredConversations = computed(() => {
  if (!searchQuery.value.trim()) return props.conversations
  const q = searchQuery.value.toLowerCase()
  return props.conversations.filter((c) => {
    const name = getCounterpart(c)?.displayName || ''
    const msg = c.lastMessage || ''
    return name.toLowerCase().includes(q) || msg.toLowerCase().includes(q)
  })
})
</script>

<template>
  <aside class="conversation-sidebar">
    <!-- Header -->
    <header class="sidebar-header">
      <h2 class="title">Messaging</h2>
      <button class="compose-btn" aria-label="Compose new message">
        <!-- Blue Pencil Compose Icon -->
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"/>
        </svg>
      </button>
    </header>

    <!-- Search Box -->
    <div class="search-wrap">
      <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="Search messages" 
        class="search-input" 
      />
    </div>

    <!-- Conversations List -->
    <div class="list-items">
      <button
        v-for="conversation in filteredConversations"
        :key="conversation.id"
        class="conv-item"
        :class="{ active: selectedId === conversation.id }"
        @click="$emit('select', conversation.id)"
      >
        <!-- Left: Avatar -->
        <div class="avatar-container">
          <template v-if="getCounterpart(conversation)">
            <img 
              v-if="getCounterpart(conversation)?.avatarUrl || getParticipantMeta(getCounterpart(conversation)!.displayName).avatar" 
              :src="getCounterpart(conversation)?.avatarUrl || getParticipantMeta(getCounterpart(conversation)!.displayName).avatar!" 
              class="avatar-img" 
              alt="Avatar" 
            />
            <div 
              v-else 
              class="avatar-placeholder"
              :class="getParticipantMeta(getCounterpart(conversation)!.displayName).initials?.toLowerCase()"
            >
              {{ getParticipantMeta(getCounterpart(conversation)!.displayName).initials }}
            </div>
            <!-- Status Dot indicator -->
            <span 
              class="status-indicator" 
              :class="{ online: getParticipantMeta(getCounterpart(conversation)!.displayName).online }"
            ></span>
          </template>
        </div>

        <!-- Right: Text details -->
        <div class="details">
          <div class="row-top">
            <strong class="name">{{ formatConversationTitle(conversation) }}</strong>
            <span class="time">{{ formatMsgTime(conversation.lastMessageAt) }}</span>
          </div>
          <div class="row-bottom">
            <span class="snippet" :class="{ unread: conversation.unreadCount > 0 }">
              {{ conversation.lastMessage }}
            </span>
            <span v-if="conversation.unreadCount > 0" class="unread-badge">
              {{ conversation.unreadCount }}
            </span>
          </div>
        </div>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.conversation-sidebar {
  border-right: 1px solid #e2e8f0;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  box-sizing: border-box;
}

/* Header */
.sidebar-header {
  padding: 1.25rem 1.25rem 0.75rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.title {
  font-size: 1.35rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.02em;
}

.compose-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: background 0.15s ease;
}

.compose-btn:hover {
  background: #eff6ff;
}

/* Search Box */
.search-wrap {
  padding: 0 1.25rem 1rem 1.25rem;
  position: relative;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.search-icon {
  position: absolute;
  left: 2rem;
  pointer-events: none;
}

.search-input {
  width: 100%;
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem 0.5rem 2.25rem;
  font-size: 0.8125rem;
  font-family: inherit;
  color: #0f172a;
  outline: none;
  box-sizing: border-box;
  transition: background 0.15s ease;
}

.search-input:focus {
  background: #e2e8f0;
}

/* List Items */
.list-items {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.conv-item {
  width: 100%;
  text-align: left;
  border: none;
  border-top: 1px solid #f1f5f9;
  background: #ffffff;
  padding: 1rem 1.25rem;
  display: flex;
  gap: 0.75rem;
  align-items: center;
  cursor: pointer;
  transition: background 0.15s ease;
  box-sizing: border-box;
}

.conv-item:hover {
  background: #f8fafc;
}

.conv-item.active {
  background: #eff6ff;
  border-left: 4px solid #2563eb;
  padding-left: 1rem; /* Adjust padding to account for border */
}

/* Avatar container */
.avatar-container {
  position: relative;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.avatar-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  color: #ffffff;
}

/* Color palettes for avatars */
.avatar-placeholder.m {
  background: #2563eb;
}

.avatar-placeholder.e {
  background: #94a3b8;
}

.status-indicator {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #94a3b8;
  border: 2px solid #ffffff;
}

.status-indicator.online {
  background: #22c55e;
}

/* Details text block */
.details {
  flex-grow: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.row-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.name {
  font-size: 0.875rem;
  font-weight: 700;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.time {
  font-size: 0.72rem;
  color: #94a3b8;
  flex-shrink: 0;
}

.row-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.snippet {
  font-size: 0.8125rem;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1;
  min-width: 0;
}

.snippet.unread {
  font-weight: 700;
  color: #0f172a;
}

.unread-badge {
  background: #2563eb;
  color: #ffffff;
  width: 17px;
  height: 17px;
  border-radius: 50%;
  font-size: 0.65rem;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-left: 8px;
}
</style>
