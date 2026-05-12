<script setup lang="ts">
defineProps<{ title?: string; message: string }>()
</script>

<template>
  <div class="card state">
    <h3>{{ title ?? 'Something went wrong' }}</h3>
    <p>{{ message }}</p>
  </div>
</template>

<style scoped>
.state { border-color: #f2c7c7; color: var(--color-error); padding: 1rem; }
</style>
