<script setup lang="ts">
defineProps<{ title: string; message?: string }>()
</script>

<template>
  <div class="state empty">
    <h3>{{ title }}</h3>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<style scoped>
.state {
  border: 1px dashed var(--color-border);
  border-radius: 12px;
  padding: 1rem;
  color: #64748b;
  background: #fff;
}
h3 {
  margin: 0 0 0.25rem;
  color: #0f172a;
}
p {
  margin: 0;
}
</style>
