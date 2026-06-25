<script setup lang="ts">
defineProps<{ open: boolean; title?: string }>()
defineEmits<{ close: [] }>()
</script>

<template>
  <teleport to="body">
    <div v-if="open" class="overlay" @click.self="$emit('close')">
      <section class="modal">
        <header v-if="title" class="head">
          <h3>{{ title }}</h3>
          <button class="close" type="button" @click="$emit('close')">&times;</button>
        </header>
        <div class="content">
          <slot />
        </div>
      </section>
    </div>
  </teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: grid;
  place-items: center;
  padding: 1rem;
  z-index: 1000;
}
.modal {
  width: min(920px, 100%);
  max-height: calc(100dvh - 2rem);
  overflow: auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 25px 50px rgba(15, 23, 42, 0.25);
}
.head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
}
.head h3 {
  margin: 0;
}
.close {
  border: none;
  background: transparent;
  font-size: 1.5rem;
  cursor: pointer;
}
.content {
  padding: 1.25rem;
}
</style>
