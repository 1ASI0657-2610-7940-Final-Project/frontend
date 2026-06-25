<script setup lang="ts">
defineProps<{ message: string; type?: 'success' | 'error' }>()
</script>

<template>
  <div :class="['toast', type || 'success']">
    {{ message }}
  </div>
</template>

<style scoped>
.toast {
  border-radius: 10px;
  padding: 0.85rem 1rem;
  font-weight: 600;
}
.success {
  background: #ecfdf3;
  color: #027a48;
  border: 1px solid #abefc6;
}
.error {
  background: #fef3f2;
  color: #b42318;
  border: 1px solid #fecdca;
}
</style>
