<script setup lang="ts">
defineProps<{ title: string; subtitle: string }>()
</script>

<template>
  <section class="card page">
    <h1 class="page-title">{{ title }}</h1>
    <p class="muted">{{ subtitle }}</p>
  </section>
</template>

<style scoped>
.page { padding: 2rem; min-height: 240px; }
.page p { margin-top: 0.75rem; font-size: 1.08rem; }
</style>
