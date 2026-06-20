<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useEngagementStore } from '@pulls/stores/engagementStore'
import RequestStatusBadge from '../components/RequestStatusBadge.vue'
import EmptyState from '../../../shared/components/EmptyState.vue'
import LoadingState from '../../../shared/components/LoadingState.vue'
import ErrorState from '../../../shared/components/ErrorState.vue'
import { formatDate } from '../../../shared/utils/formatDate'
import { formatCurrency } from '../../../shared/utils/formatCurrency'

const store = useEngagementStore()

const PAGE_SIZE = 5
const currentPage = ref(1)

const totalPages = computed(() => Math.ceil(store.outgoingRequests.length / PAGE_SIZE))
const pagedRequests = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return store.outgoingRequests.slice(start, start + PAGE_SIZE)
})

const refreshOutgoingRequests = async () => { await store.fetchOutgoingRequests() }
const handleWindowFocus = () => { void refreshOutgoingRequests() }
const handleVisibilityChange = () => { if (document.visibilityState === 'visible') void refreshOutgoingRequests() }

onMounted(async () => {
  await refreshOutgoingRequests()
  window.addEventListener('focus', handleWindowFocus)
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onBeforeUnmount(() => {
  window.removeEventListener('focus', handleWindowFocus)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<template>
  <div class="requests-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">My Requests</h1>
        <p class="page-sub muted">Track your outgoing service requests.</p>
      </div>
      <button class="filter-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
        Filter
      </button>
    </div>

    <ErrorState v-if="store.error" :message="store.error" />

    <div v-else-if="store.loading" class="loading-grid">
      <LoadingState v-for="i in 3" :key="i" />
    </div>

    <EmptyState
      v-else-if="!store.outgoingRequests.length"
      title="No requests yet"
      message="Send your first request from a service detail page."
    />

    <div v-else class="card table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Service Requested</th>
            <th>Proposed Price</th>
            <th>Delivery</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in pagedRequests" :key="item.id">
            <td class="service-cell">
              <div class="service-title">{{ item.message?.split('\n')[0] || 'Service Request' }}</div>
              <div class="service-desc muted">
                {{ item.message && item.message.length > 60 ? item.message.slice(0, 60) + '...' : (item.message || `ID: ${item.id.slice(0, 8)}...`) }}
              </div>
            </td>
            <td class="price-cell">{{ formatCurrency(item.proposedPrice, item.currency) }}</td>
            <td class="delivery-cell">
              <span v-if="item.proposedDeliveryDays">{{ item.proposedDeliveryDays }} Days</span>
              <span v-else class="muted">—</span>
            </td>
            <td class="date-cell muted">{{ formatDate(item.createdAt) }}</td>
            <td><RequestStatusBadge :status="item.status" /></td>
          </tr>
        </tbody>
      </table>

      <div class="table-footer">
        <span class="pagination-info muted">
          Showing {{ (currentPage - 1) * PAGE_SIZE + 1 }} to {{ Math.min(currentPage * PAGE_SIZE, store.outgoingRequests.length) }} of {{ store.outgoingRequests.length }} requests
        </span>
        <div class="pagination-btns">
          <button class="page-btn" :disabled="currentPage <= 1" @click="currentPage--">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button class="page-btn" :disabled="currentPage >= totalPages" @click="currentPage++">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.requests-page { display: flex; flex-direction: column; gap: 1.25rem; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; }
.page-title { margin: 0; font-size: 1.75rem; font-weight: 800; color: #0f172a; }
.page-sub { margin: 0.2rem 0 0; font-size: 0.875rem; }
.filter-btn { display: flex; align-items: center; gap: 0.5rem; border: 1px solid var(--color-border); background: #fff; color: #374151; border-radius: 8px; padding: 0.55rem 1rem; font-size: 0.875rem; font-weight: 600; cursor: pointer; }
.filter-btn:hover { background: #f8faff; }
.loading-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; }
.table-card { padding: 0; overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; padding: 0.75rem 1.5rem; font-size: 11px; text-transform: uppercase; letter-spacing: 0.07em; color: #94a3b8; font-weight: 700; border-bottom: 1px solid #e5e9f2; background: #fafbff; }
.data-table td { padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.data-table tbody tr:last-child td { border-bottom: none; }
.data-table tbody tr:hover { background: #fafbff; }
.service-cell { min-width: 200px; }
.service-title { font-weight: 600; color: #0f172a; font-size: 0.9rem; margin-bottom: 2px; }
.service-desc { font-size: 0.8rem; }
.price-cell { font-weight: 700; color: var(--color-primary); font-size: 0.925rem; white-space: nowrap; }
.delivery-cell { font-size: 0.875rem; color: #374151; white-space: nowrap; }
.date-cell { font-size: 0.825rem; white-space: nowrap; }
.table-footer { display: flex; justify-content: space-between; align-items: center; padding: 0.85rem 1.5rem; border-top: 1px solid #e5e9f2; }
.pagination-info { font-size: 0.825rem; }
.pagination-btns { display: flex; gap: 0.35rem; }
.page-btn { width: 32px; height: 32px; border: 1px solid var(--color-border); border-radius: 8px; background: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #374151; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-btn:not(:disabled):hover { background: #f4f6fb; }
</style>
