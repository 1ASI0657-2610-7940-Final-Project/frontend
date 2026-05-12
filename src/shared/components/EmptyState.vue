<script setup lang="ts">
defineProps<{ title: string; message: string }>()
</script>

<template>
  <div class="card state">
    <h3>{{ title }}</h3>
    <p class="muted">{{ message }}</p>
  </div>
</template>

<style scoped>
.state { text-align: center; padding: 2rem; }
</style>
