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
      <slot />
    </div>
  </div>
</template>

<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.45); display: grid; place-items: center; padding: 1rem; }
.modal { width: min(560px, 100%); padding: 1rem; }
header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
button { border: none; background: transparent; cursor: pointer; font-size: 1.2rem; }
</style>
