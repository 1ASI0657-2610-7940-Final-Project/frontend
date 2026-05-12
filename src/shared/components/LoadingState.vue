<template>
  <div class="card loading">
    <div class="bar" v-for="index in 3" :key="index" />
  </div>
</template>

<style scoped>
.loading { padding: 1rem; display: grid; gap: 0.6rem; }
.bar { height: 12px; border-radius: 999px; background: #d9e4fa; animation: pulse 1.2s infinite; }
@keyframes pulse { 0% { opacity: 0.45; } 50% { opacity: 1; } 100% { opacity: 0.45; } }
</style>
