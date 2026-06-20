<template>
  <div class="card skeleton-card">
    <div class="skeleton-img" />
    <div class="skeleton-body">
      <div class="avatar-row">
        <div class="avatar-circle" />
        <div class="bar name-bar" />
      </div>
      <div class="bar title-bar" />
      <div class="bar medium-bar" />
      <div class="bar short-bar" />
      <div class="price-row">
        <div class="bar price-bar" />
        <div class="bar action-bar" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-card { overflow: hidden; border-radius: 12px; padding: 0; }
.skeleton-img { width: 100%; height: 180px; background: #dde5f4; animation: pulse 1.2s infinite; }
.skeleton-body { padding: 1rem; display: flex; flex-direction: column; gap: 0.6rem; }
.bar { border-radius: 999px; background: #dde5f4; animation: pulse 1.2s infinite; height: 11px; }
.avatar-row { display: flex; align-items: center; gap: 0.5rem; }
.avatar-circle { width: 18px; height: 18px; border-radius: 50%; background: #dde5f4; animation: pulse 1.2s infinite; flex-shrink: 0; }
.name-bar { width: 55%; height: 11px; }
.title-bar { width: 92%; height: 13px; }
.medium-bar { width: 78%; }
.short-bar { width: 48%; }
.price-row { display: flex; justify-content: space-between; margin-top: 0.25rem; }
.price-bar { width: 28%; height: 14px; }
.action-bar { width: 30%; height: 14px; }
@keyframes pulse { 0% { opacity: 0.45; } 50% { opacity: 1; } 100% { opacity: 0.45; } }
</style>
