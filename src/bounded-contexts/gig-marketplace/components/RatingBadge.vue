<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ rating?: number | null }>()
const hasRating = computed(() => typeof props.rating === 'number' && Number.isFinite(props.rating))
const normalized = computed(() => (hasRating.value ? Number(props.rating).toFixed(1) : 'No rating yet'))
</script>

<template>
  <span class="rating">
    <span v-if="hasRating" class="star" aria-hidden="true">★</span>
    <span>{{ normalized }}</span>
  </span>
</template>

<style scoped>
.rating { display: inline-flex; align-items: center; gap: 0.3rem; color: #0f172a; font-weight: 700; font-size: 14px; }
.star { color: #d97706; line-height: 1; }
</style>
