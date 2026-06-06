<script setup lang="ts">
defineProps<{ open: boolean; title?: string }>()
defineEmits<{ close: [] }>()
</script>

<template>
  <div v-if="open" class="overlay" @click.self="$emit('close')">
    <div class="card modal">
      <header>
        <h3>{{ title }}</h3>
        <button @click="$emit('close')">x</button>
      </header>
      <div class="body">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.45); display: grid; place-items: center; padding: 1rem; }
.modal {
  width: min(560px, calc(100vw - 2rem));
  max-height: calc(100vh - 2rem);
  max-height: calc(100dvh - 2rem);
  padding: 1rem;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  overflow: hidden;
}
header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
button { border: none; background: transparent; cursor: pointer; font-size: 1.2rem; }
.body {
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  scrollbar-gutter: stable;
}
</style>
