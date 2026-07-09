<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useEngagementStore } from '@pulls/stores/engagementStore'
import RequestDecisionModal from '../components/RequestDecisionModal.vue'
import RequestStatusBadge from '../components/RequestStatusBadge.vue'
import EmptyState from '../../../shared/components/EmptyState.vue'
import LoadingState from '../../../shared/components/LoadingState.vue'
import ErrorState from '../../../shared/components/ErrorState.vue'
import type { DecideRequestPayload } from '@pulls/types/engagement.types'

const store = useEngagementStore()
const router = useRouter()
const open = ref(false)
const mode = ref<'ACCEPTED' | 'REJECTED'>('ACCEPTED')
const requestId = ref('')

const PAGE_SIZE = 3
const currentPage = ref(1)

const requests = computed(() => {
  if (store.incomingRequests && store.incomingRequests.length > 0) {
    return store.incomingRequests.map((r) => ({
      id: r.id,
      clientName: r.clientId ? `Client ${r.clientId.slice(0, 8)}` : 'Client',
      title: r.message?.split('\n')[0] || 'Service Request',
      message: r.message?.split('\n').slice(1).join('\n') || r.message || 'No description provided.',
      proposedPrice: r.proposedPrice,
      currency: r.currency,
      proposedDeliveryDays: r.proposedDeliveryDays || 0,
      createdAt: r.createdAt,
      status: r.status
    }))
  }
  return []
})

const totalPages = computed(() => Math.ceil(requests.value.length / PAGE_SIZE))
const pagedRequests = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return requests.value.slice(start, start + PAGE_SIZE)
})

const refreshIncomingRequests = async () => {
  try {
    await store.fetchIncomingRequests()
  } catch (err) {
    console.warn('Failed to fetch incoming requests:', err)
  }
}

const handleWindowFocus = () => { void refreshIncomingRequests() }
const handleVisibilityChange = () => { if (document.visibilityState === 'visible') void refreshIncomingRequests() }

const openDecision = (id: string, next: 'ACCEPTED' | 'REJECTED') => {
  requestId.value = id
  mode.value = next
  open.value = true
}

const submitDecision = async (payload: DecideRequestPayload) => {
  const response = await store.decideRequest(requestId.value, payload)
  open.value = false
  await store.fetchIncomingRequests()
  if (payload.decision === 'ACCEPTED' && response.project?.id) {
    const go = window.confirm('Request accepted. Open project detail?')
    if (go) router.push(`/projects/${response.project.id}`)
  }
}

const formatCurrencyCustom = (value: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

const formatDateCustom = (value: string | Date) => {
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

onMounted(async () => {
  await refreshIncomingRequests()
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
    <!-- Header -->
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
      v-else-if="!requests.length"
      title="No incoming requests"
      message="New client requests will appear here when they are created."
    />

    <div v-else class="card table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Client Name</th>
            <th>Service Requested</th>
            <th>Proposed Price</th>
            <th>Delivery</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in pagedRequests" :key="item.id">
            <td class="client-cell">
              {{ item.clientName }}
            </td>
            <td class="service-cell">
              <div class="service-title">{{ item.title }}</div>
              <div class="service-desc muted">{{ item.message }}</div>
            </td>
            <td class="price-cell">
              {{ formatCurrencyCustom(item.proposedPrice, item.currency) }}
            </td>
            <td class="delivery-cell">
              <span>{{ item.proposedDeliveryDays }} Days</span>
            </td>
            <td class="date-cell muted">
              {{ formatDateCustom(item.createdAt) }}
            </td>
            <td class="actions-cell">
              <div class="action-btns" v-if="item.status === 'PENDING'">
                <button class="btn-accept" @click="openDecision(item.id, 'ACCEPTED')">Accept</button>
                <button class="btn-reject" @click="openDecision(item.id, 'REJECTED')">Reject</button>
              </div>
              <RequestStatusBadge v-else :status="item.status" />
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="table-footer">
        <span class="pagination-info muted">
          Showing {{ (currentPage - 1) * PAGE_SIZE + 1 }} to {{ Math.min(currentPage * PAGE_SIZE, requests.length) }} of {{ requests.length }} requests
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

    <RequestDecisionModal :open="open" :mode="mode" :request-id="requestId" @close="open = false" @submit="submitDecision" />
  </div>
</template>

<style scoped>
.requests-page { display: flex; flex-direction: column; gap: 1.5rem; }

.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; }
.page-title { margin: 0; font-size: 2rem; font-weight: 800; color: #0f172a; }
.page-sub { margin: 0.35rem 0 0; font-size: 1rem; color: #475569; }
.filter-btn { display: inline-flex; align-items: center; gap: 0.5rem; border: 1px solid #cbd5e1; background: #fff; color: #334155; border-radius: 8px; padding: 0.55rem 1.1rem; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
.filter-btn:hover { background: #f8fafc; border-color: #94a3b8; }

.loading-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; }

/* Table Card Container */
.table-card { padding: 0; overflow: hidden; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05); background: #ffffff; }

.data-table { width: 100%; border-collapse: collapse; }

.data-table th { text-align: left; padding: 1.1rem 1.5rem; font-size: 0.9rem; color: #334155; font-weight: 600; border-bottom: 1px solid #e2e8f0; background: #f8fafc; }

.data-table td { padding: 1.5rem 1.5rem; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }
.data-table tbody tr:last-child td { border-bottom: none; }

.client-cell { font-weight: 700; color: #0f172a; font-size: 0.95rem; }
.service-cell { min-width: 280px; }
.service-title { font-weight: 700; color: #0f172a; font-size: 0.95rem; margin-bottom: 0.25rem; }
.service-desc { font-size: 0.85rem; color: #475569; line-height: 1.4; }

.price-cell { font-weight: 700; color: #0b57d0; font-size: 1.15rem; white-space: nowrap; }
.delivery-cell { font-weight: 700; color: #0f172a; font-size: 0.95rem; white-space: nowrap; }
.date-cell { font-size: 0.875rem; color: #475569; white-space: nowrap; }

.actions-cell { white-space: nowrap; }
.action-btns { display: flex; gap: 0.5rem; }
.btn-accept { border: none; border-radius: 8px; background: var(--color-primary); color: #fff; padding: 0.5rem 1rem; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: background 0.15s ease; }
.btn-accept:hover { opacity: 0.9; }
.btn-reject { border: 1px solid #fca5a5; border-radius: 8px; background: #fff; color: #dc2626; padding: 0.5rem 1rem; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.15s ease; }
.btn-reject:hover { background: #fff5f5; border-color: #ef4444; }

/* Pagination Footer */
.table-footer { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; border-top: 1px solid #e2e8f0; background: #f8fafc; }
.pagination-info { font-size: 0.875rem; color: #475569; }
.pagination-btns { display: flex; gap: 0.35rem; }
.page-btn { width: 32px; height: 32px; border: 1px solid #cbd5e1; border-radius: 6px; background: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #334155; transition: all 0.2s ease; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; border-color: #e2e8f0; }
.page-btn:not(:disabled):hover { background: #f1f5f9; border-color: #94a3b8; }
</style>

