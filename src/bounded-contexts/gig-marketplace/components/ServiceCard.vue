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
    <div class="thumb-wrap">
      <img class="thumb" :src="service.thumbnailUrl || 'https://via.placeholder.com/420x220?text=GigU'" :alt="service.title" />
      <button class="bookmark" @click.stop title="Save service">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
        </svg>
      </button>
    </div>
    <div class="body">
      <span class="chip">{{ categoryLabel }}</span>
      <h3>{{ service.title }}</h3>
      <p class="meta-name muted">{{ service.freelancerDisplayName }}</p>
      <RatingBadge :rating="service.averageRating" />
      <div class="price-row">
        <div class="price-block">
          <span class="starting-at">STARTING AT</span>
          <strong class="price">{{ formatCurrency(service.basePrice, service.currency || 'USD') }}</strong>
        </div>
        <span class="view">View Details</span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.service-card { cursor: pointer; overflow: hidden; border-radius: 12px; display: flex; flex-direction: column; }
.thumb-wrap { position: relative; }
.thumb { width: 100%; height: 180px; object-fit: cover; display: block; }
.bookmark {
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #374151;
  transition: background 0.15s;
}
.bookmark:hover { background: #fff; color: var(--color-primary); }
.body { padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem; flex: 1; }
h3 { font-size: 0.95rem; line-height: 1.3; font-weight: 600; margin: 0; }
.meta-name { font-size: 0.8rem; margin: 0; }
.chip { width: fit-content; font-size: 11px; font-weight: 600; border: 1px solid var(--color-border); border-radius: 999px; padding: 3px 10px; background: #f8faff; color: #374151; }
.price-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: auto; padding-top: 0.25rem; }
.price-block { display: flex; flex-direction: column; gap: 1px; }
.starting-at { font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; font-weight: 600; }
.price { font-size: 1.15rem; color: var(--color-primary); font-weight: 700; }
.view { color: var(--color-primary); font-weight: 700; font-size: 0.85rem; }
</style>
