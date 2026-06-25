<script setup lang="ts">
defineProps<{ message: string }>()
</script>

<template>
  <div class="state error">
    <strong>Something went wrong</strong>
    <p>{{ message }}</p>
  </div>
</template>

<style scoped>
.state {
  border: 1px solid #fecdca;
  border-radius: 12px;
  padding: 1rem;
  color: #b42318;
  background: #fef3f2;
}
strong {
  display: block;
  margin-bottom: 0.25rem;
}
p {
  margin: 0;
}
</style>
