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
    </header>

    <div class="layout">
      <MarketplaceFilters v-model="localFilters" :categories="store.categories" @apply="applyFilters" />

      <div class="content">
        <ErrorState v-if="store.error" :message="store.error" />
        <div v-else-if="store.loading" class="grid">
          <LoadingState v-for="index in 6" :key="index" />
        </div>
        <EmptyState v-else-if="store.services.length === 0" title="No services found" message="Try adjusting your filters." />
        <div v-else class="grid">
          <ServiceCard v-for="service in store.services" :key="service.id" :service="service" @select="openService" />
        </div>

        <div class="pagination" v-if="store.services.length">
          <button :disabled="(localFilters.page || 1) <= 1" @click="goToPage((localFilters.page || 1) - 1)">Prev</button>
          <span>Page {{ localFilters.page || 1 }} of {{ totalPages }}</span>
          <button :disabled="(localFilters.page || 1) >= totalPages" @click="goToPage((localFilters.page || 1) + 1)">Next</button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.marketplace-page { display: grid; gap: 1.5rem; }
.layout { display: grid; grid-template-columns: 290px 1fr; gap: 1rem; align-items: start; }
.content { display: grid; gap: 1rem; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 0.75rem; }
.pagination button { border: 1px solid var(--color-border); background: #fff; padding: 0.45rem 0.85rem; border-radius: 8px; cursor: pointer; }
@media (max-width: 1020px) { .layout { grid-template-columns: 1fr; } }
</style>
