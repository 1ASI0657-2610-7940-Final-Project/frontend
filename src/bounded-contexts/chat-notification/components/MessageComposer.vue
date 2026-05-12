<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{ send: [content: string] }>()
const content = ref('')

const submit = () => {
  const value = content.value.trim()
  if (!value) return
  emit('send', value)
  content.value = ''
}
</script>

<template>
  <form class="composer" @submit.prevent="submit">
    <input v-model="content" placeholder="Write a message..." />
    <button>Send</button>
  </form>
</template>

<style scoped>
.composer { display: grid; grid-template-columns: 1fr auto; gap: 0.6rem; padding: 0.8rem; border-top: 1px solid var(--color-border); background: #fff; }
input { width: 100%; border: 1px solid #cdd6e3; border-radius: 999px; padding: 0.7rem 0.95rem; }
button { border: none; border-radius: 999px; background: #0a66c2; color: #fff; padding: 0.7rem 1rem; font-weight: 700; }
</style>
