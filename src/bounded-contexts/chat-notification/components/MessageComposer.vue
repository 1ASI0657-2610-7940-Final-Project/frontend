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
  <div class="composer-container">
    <!-- Paperclip attachment button -->
    <button class="attach-btn" aria-label="Attach file">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
      </svg>
    </button>

    <!-- Composer form wrapper -->
    <form class="composer-form" @submit.prevent="submit">
      <input 
        v-model="content" 
        placeholder="Write a message..." 
        class="composer-input"
      />
      <!-- Send paper airplane icon button inside the input -->
      <button type="submit" class="send-btn" :disabled="!content.trim()" aria-label="Send message">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polyline points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </button>
    </form>
  </div>
</template>

<style scoped>
.composer-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1.25rem;
  border-top: 1px solid #e2e8f0;
  background: #ffffff;
  box-sizing: border-box;
  flex-shrink: 0;
}

.attach-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.35rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.15s ease;
  flex-shrink: 0;
}

.attach-btn:hover {
  background: #f1f5f9;
}

.composer-form {
  position: relative;
  flex-grow: 1;
  display: flex;
  align-items: center;
}

.composer-input {
  width: 100%;
  background: #eff6ff; /* light greyish blue/lavender background */
  border: 1px solid transparent;
  border-radius: 9999px;
  padding: 0.6rem 2.75rem 0.6rem 1.15rem;
  font-size: 0.875rem;
  font-family: inherit;
  color: #0f172a;
  outline: none;
  box-sizing: border-box;
  transition: all 0.15s ease;
}

.composer-input:focus {
  background: #ffffff;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.08);
}

.send-btn {
  position: absolute;
  right: 0.85rem;
  background: none;
  border: none;
  color: #2563eb;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  transition: opacity 0.15s ease, color 0.15s ease;
}

.send-btn:hover:not(:disabled) {
  color: #1d4ed8;
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
