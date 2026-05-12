<script setup lang="ts">
defineProps<{ images: string[] }>()
</script>

<template>
  <div class="grid">
    <div class="card tile" v-for="image in images" :key="image">
      <img :src="image" alt="preview" />
    </div>
  </div>
</template>

<style scoped>
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 0.75rem; }
.tile { overflow: hidden; }
img { width: 100%; height: 100%; object-fit: cover; display: block; }
</style>
