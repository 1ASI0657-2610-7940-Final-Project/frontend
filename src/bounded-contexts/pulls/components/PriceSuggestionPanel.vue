<script setup lang="ts">
import { ref } from 'vue'
import { useEngagementStore } from '@pulls/stores/engagementStore'
import type { PriceSuggestionPayload } from '@pulls/types/engagement.types'

const emit = defineEmits<{ apply: [value: number] }>()
const store = useEngagementStore()

const form = ref<PriceSuggestionPayload>({
  serviceType: 'LANDING_PAGE',
  complexity: 'MEDIUM',
  urgency: 'NORMAL',
  freelancerExperience: 'INTERMEDIATE'
})

const suggest = async () => {
  await store.suggestPrice(form.value)
}
</script>

<template>
  <section class="card panel">
    <h3>Price Suggestion</h3>
    <div class="grid">
      <label><span>Service Type</span><input v-model="form.serviceType" /></label>
      <label>
        <span>Complexity</span>
        <select v-model="form.complexity"><option>LOW</option><option>MEDIUM</option><option>HIGH</option></select>
      </label>
      <label>
        <span>Urgency</span>
        <select v-model="form.urgency"><option>NORMAL</option><option>URGENT</option></select>
      </label>
      <label>
        <span>Experience</span>
        <select v-model="form.freelancerExperience"><option>JUNIOR</option><option>INTERMEDIATE</option><option>SENIOR</option></select>
      </label>
    </div>
    <button class="suggest" type="button" @click="suggest">Get Suggestion</button>
    <div class="result" v-if="store.priceSuggestion">
      <span class="muted">Suggested Range</span>
      <strong>{{ store.priceSuggestion.suggestedMinPrice }} - {{ store.priceSuggestion.suggestedMaxPrice }} {{ store.priceSuggestion.currency }}</strong>
      <div class="actions">
        <button type="button" @click="emit('apply', store.priceSuggestion.suggestedMinPrice)">Use Min</button>
        <button type="button" @click="emit('apply', store.priceSuggestion.suggestedMaxPrice)">Use Max</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.panel { padding: 1rem; display: grid; gap: 0.8rem; }
.grid { display: grid; gap: 0.55rem; }
label { display: grid; gap: 0.3rem; }
span { font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 700; }
input, select { border: 1px solid var(--color-border); border-radius: 8px; padding: 0.55rem 0.7rem; }
.suggest { border: none; border-radius: 8px; background: var(--color-primary); color: #fff; font-weight: 700; padding: 0.55rem 0.8rem; }
.result { display: grid; gap: 0.45rem; }
.actions { display: flex; gap: 0.45rem; }
.actions button { border: 1px solid var(--color-border); border-radius: 8px; padding: 0.4rem 0.65rem; background: #fff; }
</style>
