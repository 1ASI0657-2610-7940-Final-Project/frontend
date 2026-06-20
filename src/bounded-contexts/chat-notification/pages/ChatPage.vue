<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { useRoute } from 'vue-router'
import ConversationList from '../components/ConversationList.vue'
import MessageThread from '../components/MessageThread.vue'
import MessageComposer from '../components/MessageComposer.vue'
import EmptyState from '../../../shared/components/EmptyState.vue'
import LoadingState from '../../../shared/components/LoadingState.vue'
import ErrorState from '../../../shared/components/ErrorState.vue'
import ReportUserModal from '@chat/components/ReportUserModal.vue'
import { useChatStore } from '@chat/stores/chatStore'
import { useAuthStore } from '../../../app/stores/authStore'
import { getConversationCounterpart, getParticipantMeta } from '@chat/utils/chatHelpers'

const chatStore = useChatStore()
const authStore = useAuthStore()
const route = useRoute()
const reportOpen = ref(false)
const showMenu = ref(false)
const threadRef = ref<InstanceType<typeof MessageThread> | null>(null)
const chatShellRef = ref<HTMLElement | null>(null)

const selectedId = computed(() => chatStore.selectedConversation?.id)
const activeConversationSummary = computed(() => chatStore.conversations.find((c) => c.id === selectedId.value))
const activeParticipant = computed(() =>
  getConversationCounterpart(activeConversationSummary.value?.participants, authStore.user?.id)
)
const selectedParticipant = computed(() => activeParticipant.value?.id || '')

const activeName = computed(() => {
  return activeParticipant.value?.displayName || 'Conversation'
})

const activeMeta = computed(() => {
  return getParticipantMeta(activeName.value)
})

const activeConversationCode = computed(() => {
  const raw = chatStore.selectedConversation?.projectId || selectedId.value || ''
  const trimmed = raw.trim()
  if (!trimmed) return ''
  if (/^PRJ-\d+$/i.test(trimmed)) return trimmed.toUpperCase()
  const uuidLike = trimmed.replace(/-/g, '')
  if (/^[a-f0-9]{32}$/i.test(uuidLike)) {
    return uuidLike.slice(0, 8)
  }
  return trimmed.length > 12 ? trimmed.slice(0, 8) : trimmed
})

const activeHeaderTitle = computed(() => {
  return activeConversationCode.value ? `${activeName.value} - ${activeConversationCode.value}` : activeName.value
})

let resizeObserver: ResizeObserver | null = null
let visualViewportResizeHandler: (() => void) | null = null

const scrollThreadToBottom = async () => {
  await nextTick()
  threadRef.value?.scrollToBottom('auto')
}

const selectConversation = async (id: string) => {
  await chatStore.selectConversation(id)
  await scrollThreadToBottom()
}

const send = async (content: string) => {
  if (!chatStore.selectedConversation) return
  await chatStore.sendMessage(chatStore.selectedConversation.id, { content })
  await scrollThreadToBottom()
}

const reportUser = () => {
  showMenu.value = false
  reportOpen.value = true
}

onMounted(async () => {
  await chatStore.fetchConversations()
  const queryConversationId = typeof route.query.conversationId === 'string' ? route.query.conversationId : ''
  if (queryConversationId) {
    await selectConversation(queryConversationId)
  } else if (chatStore.conversations[0]) {
    await selectConversation(chatStore.conversations[0].id)
  } else {
    await scrollThreadToBottom()
  }

  resizeObserver = new ResizeObserver(() => {
    void scrollThreadToBottom()
  })

  if (chatShellRef.value) {
    resizeObserver.observe(chatShellRef.value)
  }

  if (window.visualViewport) {
    visualViewportResizeHandler = () => {
      void scrollThreadToBottom()
    }
    window.visualViewport.addEventListener('resize', visualViewportResizeHandler)
  } else {
    window.addEventListener('resize', scrollThreadToBottom)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null

  if (window.visualViewport && visualViewportResizeHandler) {
    window.visualViewport.removeEventListener('resize', visualViewportResizeHandler)
    visualViewportResizeHandler = null
  } else {
    window.removeEventListener('resize', scrollThreadToBottom)
  }
})

onBeforeRouteLeave(() => {
  chatStore.disconnectRealtime()
})
</script>

<template>
  <section ref="chatShellRef" class="chat-layout">
    <ConversationList :conversations="chatStore.conversations" :selected-id="selectedId" @select="selectConversation" />

    <div class="main">
      <ErrorState v-if="chatStore.error" :message="chatStore.error" />
      <LoadingState v-else-if="chatStore.loading" />
      <EmptyState v-else-if="!chatStore.selectedConversation" title="No conversation selected" message="Choose a conversation from the left panel." />

      <template v-else>
        <!-- Header -->
        <header class="thread-head">
          <div class="user-details">
            <div class="avatar-container">
              <img v-if="activeMeta.avatar" :src="activeMeta.avatar" class="head-avatar" alt="Avatar" />
              <div v-else class="head-avatar placeholder">{{ activeMeta.initials }}</div>
              <span class="status-dot" :class="{ online: activeMeta.online }"></span>
            </div>
            <div class="user-info">
              <strong class="user-name">{{ activeHeaderTitle }}</strong>
            </div>
          </div>

          <div class="head-tools">
            <div class="menu-container">
              <button class="options-btn" @click="showMenu = !showMenu" aria-label="More options">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
                </svg>
              </button>
              <div v-if="showMenu" class="dropdown-menu card">
                <button @click="reportUser" class="menu-item">Report User</button>
              </div>
            </div>
          </div>
        </header>

        <div class="chat-body">
          <!-- Message List Thread -->
          <div class="thread-shell">
            <MessageThread ref="threadRef" :messages="chatStore.messages" :auth-user-id="authStore.user?.id" />
          </div>

          <!-- Composer -->
          <MessageComposer @send="send" />
        </div>
      </template>
    </div>

    <ReportUserModal :open="reportOpen" :reported-user-id="selectedParticipant" @close="reportOpen = false" />
  </section>
</template>

<style scoped>
.chat-layout { 
  display: grid; 
  grid-template-columns: 320px minmax(0, 1fr); 
  height: 95dvh; 
  max-height: 95dvh;
  width: 100%;
  min-height: 0;
  background: #ffffff; 
  box-sizing: border-box;
  overflow: hidden;
}
.main {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}
.chat-body {
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1 1 auto;
  overflow: hidden;
}
.thread-shell {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
  display: flex;
  align-items: stretch;
}

/* Thread Header */
.thread-head { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  flex-shrink: 0;
  border-bottom: 1px solid #e2e8f0; 
  padding: 0.85rem 1.25rem; 
  background: #ffffff; 
}
.user-details {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar-container {
  position: relative;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}
.head-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}
.head-avatar.placeholder {
  background: #2563eb;
  color: #fff;
  font-weight: 700;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.status-dot {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #94a3b8;
  border: 1.5px solid #ffffff;
}
.status-dot.online {
  background: #22c55e;
}

.user-info {
  display: flex;
  flex-direction: column;
}
.user-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
}

/* Options dropdown */
.head-tools { display: flex; align-items: center; }
.menu-container { position: relative; }
.options-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.35rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease;
}
.options-btn:hover {
  background: #f1f5f9;
}
.dropdown-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 5px);
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
  padding: 0.25rem;
  z-index: 10;
  width: 130px;
}
.menu-item {
  width: 100%;
  text-align: left;
  border: none;
  background: none;
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
  color: #b42318;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
}
.menu-item:hover {
  background: #fef2f2;
}

@media (max-width: 980px) { .chat-layout { grid-template-columns: 1fr; } }

@media (max-width: 980px) {
  .chat-layout {
    grid-template-columns: 1fr;
    grid-template-rows: minmax(180px, 34dvh) minmax(0, 1fr);
  }

  .main {
    min-height: 0;
  }
}
</style>
