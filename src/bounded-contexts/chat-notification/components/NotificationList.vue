<script setup lang="ts">
import type { NotificationItem } from '@chat/types/chat.types'
import { formatDate } from '../../../shared/utils/formatDate'

defineProps<{ items: NotificationItem[] }>()
defineEmits<{ read: [id: string]; open: [item: NotificationItem] }>()
</script>

<template>
  <section class="list">
    <article v-for="item in items" :key="item.id" class="card item" :class="{ unread: !item.read }" @click="$emit('open', item)">
      <div class="top">
        <strong>{{ item.title }}</strong>
        <span class="muted">{{ formatDate(item.createdAt) }}</span>
      </div>
      <p>{{ item.message }}</p>
      <button v-if="!item.read" @click.stop="$emit('read', item.id)">Mark as read</button>
    </article>
  </section>
</template>

<style scoped>
.list { display: grid; gap: 0.8rem; }
.item { padding: 1rem; border-radius: 12px; }
.item.unread { border-left: 4px solid #0a66c2; background: #f4f8ff; }
.top { display: flex; justify-content: space-between; gap: 0.5rem; }
p { margin: 0.45rem 0; color: #475569; }
button { border: 1px solid var(--color-primary); color: var(--color-primary); border-radius: 8px; background: #fff; padding: 0.35rem 0.6rem; }
</style>
