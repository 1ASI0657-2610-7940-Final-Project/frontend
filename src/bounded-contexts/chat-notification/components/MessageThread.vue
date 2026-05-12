<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import MessageBubble from './MessageBubble.vue'
import type { ChatMessage } from '@chat/types/chat.types'

const props = defineProps<{ messages: ChatMessage[]; authUserId?: string }>()
const threadEl = ref<HTMLElement | null>(null)
const sortedMessages = computed(() => [...props.messages].sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()))

const isNearBottom = () => {
  const el = threadEl.value
  if (!el) return true
  return el.scrollHeight - el.scrollTop - el.clientHeight < 80
}

const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
  const el = threadEl.value
  if (!el) return
  el.scrollTo({ top: el.scrollHeight, behavior })
}

defineExpose({ scrollToBottom })

watch(
  () => sortedMessages.value.map((m) => `${m.id}:${m.sentAt}`).join('|'),
  async () => {
    const shouldStick = isNearBottom()
    await nextTick()
    if (shouldStick) scrollToBottom('auto')
  },
  { flush: 'post' }
)
</script>

<template>
  <div ref="threadEl" class="thread">
    <MessageBubble v-for="message in sortedMessages" :key="message.id" :message="message" :own="authUserId === message.senderId" />
  </div>
</template>

<style scoped>
.thread { display: grid; gap: 0.75rem; padding: 1rem; overflow-y: auto; min-height: 0; height: 100%; }
</style>
