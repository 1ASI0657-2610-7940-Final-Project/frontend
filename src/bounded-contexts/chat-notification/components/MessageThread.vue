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

interface ThreadItem {
  type: 'message' | 'date-divider'
  id: string
  message?: ChatMessage
  dateText?: string
  showAvatar?: boolean
  showTimestamp?: boolean
  own?: boolean
}

const getDateDividerText = (sentAt: string) => {
  const d = new Date(sentAt)
  if (isNaN(d.getTime())) return 'Today'
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffDays === 0 && d.getDate() === now.getDate()) {
    return 'Today'
  } else if (diffDays === 1 || (diffDays === 0 && d.getDate() !== now.getDate())) {
    return 'Yesterday'
  } else {
    return d.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })
  }
}

const threadItems = computed(() => {
  const items: ThreadItem[] = []
  const msgs = sortedMessages.value
  
  for (let i = 0; i < msgs.length; i++) {
    const msg = msgs[i]
    const dateText = getDateDividerText(msg.sentAt)
    
    // Check if we need to insert a date divider
    if (i === 0) {
      items.push({
        type: 'date-divider',
        id: `date-${msg.id}`,
        dateText
      })
    } else {
      const prevMsg = msgs[i - 1]
      const prevDateText = getDateDividerText(prevMsg.sentAt)
      if (dateText !== prevDateText) {
        items.push({
          type: 'date-divider',
          id: `date-${msg.id}`,
          dateText
        })
      }
    }
    
    // Determine if last in group of consecutive messages by same sender
    const own = props.authUserId === msg.senderId
    const isLastInGroup = (i === msgs.length - 1) || (msgs[i + 1].senderId !== msg.senderId)
    
    items.push({
      type: 'message',
      id: msg.id,
      message: msg,
      own,
      showAvatar: !own && isLastInGroup,
      showTimestamp: isLastInGroup
    })
  }
  
  return items
})

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
    <template v-for="item in threadItems" :key="item.id">
      <div v-if="item.type === 'date-divider'" class="date-divider">
        <span class="date-pill">{{ item.dateText }}</span>
      </div>
      <MessageBubble 
        v-else-if="item.type === 'message' && item.message" 
        :message="item.message" 
        :own="item.own !!" 
        :show-avatar="item.showAvatar !!" 
        :show-timestamp="item.showTimestamp !!" 
      />
    </template>
  </div>
</template>

<style scoped>
.thread { display: flex; flex-direction: column; gap: 0.85rem; padding: 1.5rem; overflow-y: auto; min-height: 0; height: 100%; background: #ffffff; }
.date-divider { display: flex; justify-content: center; margin: 1rem 0; }
.date-pill { background: #f1f5f9; color: #64748b; font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.75rem; border-radius: 9999px; border: 1px solid #e2e8f0; }
</style>
