<script setup lang="ts">
import type { ProjectReview } from '@pulls/types/engagement.types'
import { formatDate } from '../../../shared/utils/formatDate'

defineProps<{ reviews: ProjectReview[] }>()
</script>

<template>
  <section class="card reviews">
    <h3>Reviews</h3>
    <div v-if="!reviews.length" class="muted">No reviews yet.</div>
    <article v-for="review in reviews" :key="review.id" class="review-item">
      <div class="head"><strong>{{ review.rating }}/5</strong><span class="muted">{{ formatDate(review.createdAt) }}</span></div>
      <p>{{ review.comment }}</p>
    </article>
  </section>
</template>

<style scoped>
.reviews { padding: 1rem; display: grid; gap: 0.75rem; }
.review-item { border-top: 1px solid var(--color-border); padding-top: 0.75rem; }
.head { display: flex; justify-content: space-between; }
p { margin: 0.35rem 0 0; color: #334155; }
</style>
