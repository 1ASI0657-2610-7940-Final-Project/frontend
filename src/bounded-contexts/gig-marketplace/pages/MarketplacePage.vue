<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MarketplaceFilters from '../components/MarketplaceFilters.vue'
import ServiceCard from '../components/ServiceCard.vue'
import LoadingState from '../../../shared/components/LoadingState.vue'
import EmptyState from '../../../shared/components/EmptyState.vue'
import ErrorState from '../../../shared/components/ErrorState.vue'
import { useMarketplaceStore } from '@marketplace/stores/marketplaceStore'
import type { ServiceFilters } from '@marketplace/types/marketplace.types'

const route = useRoute()
const router = useRouter()
const store = useMarketplaceStore()

const localFilters = ref<ServiceFilters>({ q: '', page: 1, pageSize: 9 })

const totalPages = computed(() => Math.max(1, Math.ceil(store.pagination.total / store.pagination.pageSize)))

const syncFromRoute = () => {
  localFilters.value = {
    q: typeof route.query.q === 'string' ? route.query.q : '',
    category: typeof route.query.category === 'string' ? route.query.category : undefined,
    priceMin: route.query.priceMin ? Number(route.query.priceMin) : undefined,
    priceMax: route.query.priceMax ? Number(route.query.priceMax) : undefined,
    minRating: route.query.minRating ? Number(route.query.minRating) : undefined,
    page: route.query.page ? Number(route.query.page) : 1,
    pageSize: route.query.pageSize ? Number(route.query.pageSize) : 9
  }
}

const fetchData = async () => {
  await Promise.all([store.fetchCategories(), store.fetchServices(localFilters.value)])
}

const applyFilters = async () => {
  await router.replace({ query: Object.fromEntries(Object.entries(localFilters.value).filter(([, value]) => value !== undefined && value !== '')) })
  await store.fetchServices(localFilters.value)
}

const clearFilters = async () => {
  localFilters.value = { q: '', page: 1, pageSize: 9 }
  await router.replace({ query: {} })
  await store.fetchServices(localFilters.value)
}

const goToPage = async (page: number) => {
  localFilters.value = { ...localFilters.value, page }
  await applyFilters()
}

const openService = (id: string) => router.push(`/marketplace/services/${id}`)

watch(() => route.query, async () => {
  syncFromRoute()
  await store.fetchServices(localFilters.value)
})

onMounted(async () => {
  syncFromRoute()
  await fetchData()
})
</script>

<template>
  <section class="marketplace-page">
    <header class="head">
      <div>
        <h1 class="page-title">Explore Services</h1>
        <p class="muted">Find top-tier university talent for your next startup project.</p>
      </div>
      <div class="sort-row">
        <span class="sort-label">Sort by:</span>
        <select class="sort-select">
          <option>Recommended</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
          <option>Rating</option>
        </select>
      </div>
    </header>

    <div class="layout">
      <MarketplaceFilters v-model="localFilters" :categories="store.categories" @apply="applyFilters" />

      <div class="content">
        <ErrorState v-if="store.error" :message="store.error" />
        <div v-else-if="store.loading" class="grid">
          <LoadingState v-for="index in 6" :key="index" />
        </div>
        <EmptyState
          v-else-if="store.services.length === 0"
          title="No services found"
          message="If we couldn't find any services matching your current filter criteria. Try adjusting your categories or price range."
          action-label="Clear All Filters"
          @action="clearFilters"
        />
        <div v-else class="grid">
          <ServiceCard v-for="service in store.services" :key="service.id" :service="service" @select="openService" />
        </div>

        <div class="pagination" v-if="store.services.length">
          <button :disabled="(localFilters.page || 1) <= 1" @click="goToPage((localFilters.page || 1) - 1)">Prev</button>
          <span>Page {{ localFilters.page || 1 }} of {{ totalPages }}</span>
          <button :disabled="(localFilters.page || 1) >= totalPages" @click="goToPage((localFilters.page || 1) + 1)">Next</button>
        </div>

        <hr class="divider" />

        <div class="demo-section-label">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
          Loading State Example
        </div>
        <div class="grid">
          <LoadingState v-for="i in 2" :key="i" />
        </div>

        <hr class="divider" />

        <div class="demo-section-label">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
          Empty State Example
        </div>
        <EmptyState
          title="No services found"
          message="If we couldn't find any services matching your current filter criteria. Try adjusting your categories or price range."
          action-label="Clear All Filters"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.marketplace-page { display: grid; gap: 1.5rem; }
.head { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 0.75rem; }
.sort-row { display: flex; align-items: center; gap: 0.5rem; }
.sort-label { font-size: 0.875rem; color: #64748b; white-space: nowrap; }
.sort-select { border: 1px solid var(--color-border); border-radius: 8px; padding: 0.45rem 2rem 0.45rem 0.75rem; font-size: 0.875rem; background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 0.5rem center; appearance: none; cursor: pointer; }
.layout { display: grid; grid-template-columns: 240px 1fr; gap: 1.25rem; align-items: start; }
.content { display: grid; gap: 1rem; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 0.75rem; }
.pagination button { border: 1px solid var(--color-border); background: #fff; padding: 0.45rem 0.85rem; border-radius: 8px; cursor: pointer; }
@media (max-width: 1020px) { .layout { grid-template-columns: 1fr; } }
.divider { border: none; border-top: 1px solid var(--color-border); margin: 0.5rem 0; }
.demo-section-label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: #64748b; font-weight: 500; }
</style>
