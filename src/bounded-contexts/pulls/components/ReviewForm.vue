<script setup lang="ts">
import { ref } from 'vue'
import type { CreateProjectReviewPayload } from '@pulls/types/engagement.types'

const props = defineProps<{ revieweeId: string }>()
const emit = defineEmits<{ submit: [payload: CreateProjectReviewPayload] }>()

const rating = ref(5)
const comment = ref('')

const submit = () => {
  emit('submit', { revieweeId: props.revieweeId, rating: rating.value, comment: comment.value })
  comment.value = ''
}
</script>

<template>
  <form class="card form" @submit.prevent="submit">
    <h3>Leave Review</h3>
    <label>
      <span>Rating</span>
      <input type="number" min="1" max="5" v-model.number="rating" />
    </label>
    <label>
      <span>Comment</span>
      <textarea rows="4" v-model="comment" />
    </label>
    <button>Submit Review</button>
  </form>
</template>

<style scoped>
.form { padding: 1rem; display: grid; gap: 0.75rem; }
label { display: grid; gap: 0.35rem; }
input, textarea { border: 1px solid var(--color-border); border-radius: 8px; padding: 0.6rem 0.75rem; }
button { justify-self: end; border: none; background: var(--color-primary); color: #fff; border-radius: 8px; padding: 0.5rem 0.9rem; font-weight: 700; }
</style>
