<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
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

const chatStore = useChatStore()
const authStore = useAuthStore()
const route = useRoute()
const reportOpen = ref(false)
const threadRef = ref<InstanceType<typeof MessageThread> | null>(null)

const selectedId = computed(() => chatStore.selectedConversation?.id)
const selectedParticipant = computed(() => chatStore.conversations.find((c) => c.id === selectedId.value)?.participants?.[0]?.id || '')

const selectConversation = async (id: string) => {
  await chatStore.selectConversation(id)
  await nextTick()
  threadRef.value?.scrollToBottom()
}

const send = async (content: string) => {
  if (!chatStore.selectedConversation) return
  await chatStore.sendMessage(chatStore.selectedConversation.id, { content })
  await nextTick()
  threadRef.value?.scrollToBottom()
}

onMounted(async () => {
  await chatStore.fetchConversations()
  const queryConversationId = typeof route.query.conversationId === 'string' ? route.query.conversationId : ''
  if (queryConversationId) {
    await selectConversation(queryConversationId)
    return
  }
  if (chatStore.conversations[0]) await selectConversation(chatStore.conversations[0].id)
})

onBeforeRouteLeave(() => {
  chatStore.disconnectRealtime()
})
</script>

<template>
  <section class="chat-layout card">
    <ConversationList :conversations="chatStore.conversations" :selected-id="selectedId" @select="selectConversation" />

    <div class="main">
      <ErrorState v-if="chatStore.error" :message="chatStore.error" />
      <LoadingState v-else-if="chatStore.loading" />
      <EmptyState v-else-if="!chatStore.selectedConversation" title="No conversation selected" message="Choose a conversation from the left panel." />

      <template v-else>
        <header class="thread-head">
          <strong>{{ chatStore.conversations.find((c) => c.id === selectedId)?.participants?.[0]?.displayName || 'Conversation' }}</strong>
          <div class="head-tools">
            <button @click="reportOpen = true">Report User</button>
          </div>
        </header>
        <MessageThread ref="threadRef" :messages="chatStore.messages" :auth-user-id="authStore.user?.id" />
        <MessageComposer @send="send" />
      </template>
    </div>

    <ReportUserModal :open="reportOpen" :reported-user-id="selectedParticipant" @close="reportOpen = false" />
  </section>
</template>

<style scoped>
.chat-layout { display: grid; grid-template-columns: 320px 1fr; min-height: 78vh; overflow: hidden; }
.main { display: grid; grid-template-rows: auto 1fr auto; min-height: 0; }
.thread-head { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border); padding: 0.85rem 1rem; background: #fff; }
.head-tools { display: flex; gap: 0.45rem; align-items: center; }
.thread-head button { border: 1px solid var(--color-border); border-radius: 8px; background: #fff; padding: 0.35rem 0.6rem; }
@media (max-width: 980px) { .chat-layout { grid-template-columns: 1fr; } }
</style>
