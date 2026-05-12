<script setup lang="ts">
import { computed } from 'vue'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import RatingBadge from './RatingBadge.vue'
import type { ServicesListItem } from '@marketplace/types/marketplace.types'

const props = defineProps<{ service: ServicesListItem }>()
const emit = defineEmits<{ select: [id: string] }>()
const categoryLabel = computed(() => props.service.category || 'General')
</script>

<template>
  <article class="card service-card" @click="emit('select', service.id)">
    <img class="thumb" :src="service.thumbnailUrl || 'https://via.placeholder.com/420x220?text=GigU'" :alt="service.title" />
    <div class="body">
      <span class="chip">{{ categoryLabel }}</span>
      <h3>{{ service.title }}</h3>
      <p class="muted description">{{ service.descriptionPreview }}</p>
      <div class="meta">
        <span class="muted">{{ service.freelancerDisplayName }}</span>
        <RatingBadge :rating="service.averageRating" />
      </div>
      <div class="price-row">
        <strong>{{ formatCurrency(service.basePrice, service.currency || 'USD') }}</strong>
        <span class="view">View Details</span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.service-card { cursor: pointer; overflow: hidden; border-radius: 12px; }
.thumb { width: 100%; height: 180px; object-fit: cover; display: block; }
.body { padding: 1rem; display: grid; gap: 0.55rem; }
h3 { font-size: 1.55rem; line-height: 1.25; }
.description { margin: 0; min-height: 40px; }
.chip { width: fit-content; font-size: 12px; border: 1px solid var(--color-border); border-radius: 999px; padding: 4px 10px; background: #f8faff; }
.meta, .price-row { display: flex; justify-content: space-between; align-items: center; }
.price-row strong { font-size: 1.35rem; color: var(--color-primary); }
.view { color: var(--color-primary); font-weight: 700; }
</style>
