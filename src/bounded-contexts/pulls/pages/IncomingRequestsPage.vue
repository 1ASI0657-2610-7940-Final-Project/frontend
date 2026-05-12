<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useEngagementStore } from '@pulls/stores/engagementStore'
import RequestDecisionModal from '../components/RequestDecisionModal.vue'
import RequestStatusBadge from '../components/RequestStatusBadge.vue'
import LoadingState from '../../../shared/components/LoadingState.vue'
import EmptyState from '../../../shared/components/EmptyState.vue'
import ErrorState from '../../../shared/components/ErrorState.vue'
import { formatDate } from '../../../shared/utils/formatDate'
import type { DecideRequestPayload } from '@pulls/types/engagement.types'

const store = useEngagementStore()
const router = useRouter()
const open = ref(false)
const mode = ref<'ACCEPTED' | 'REJECTED'>('ACCEPTED')
const requestId = ref('')

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

onMounted(async () => { await store.fetchIncomingRequests() })
</script>

<template>
  <section class="page">
    <h1 class="page-title">Incoming Requests</h1>
    <p class="muted">Review and respond to new service requests.</p>

    <ErrorState v-if="store.error" :message="store.error" />
    <LoadingState v-else-if="store.loading" />
    <EmptyState v-else-if="!store.incomingRequests.length" title="No incoming requests" message="New requests will appear here." />

    <div class="card table-wrap" v-else>
      <table>
        <thead><tr><th>Request</th><th>Proposed Price</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody>
          <tr v-for="item in store.incomingRequests" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.proposedPrice }} {{ item.currency }}</td>
            <td><RequestStatusBadge :status="item.status" /></td>
            <td>{{ formatDate(item.createdAt) }}</td>
            <td class="actions">
              <button @click="openDecision(item.id, 'ACCEPTED')">Accept</button>
              <button @click="openDecision(item.id, 'REJECTED')">Reject</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <RequestDecisionModal :open="open" :mode="mode" :request-id="requestId" @close="open = false" @submit="submitDecision" />
  </section>
</template>

<style scoped>
.page { display: grid; gap: 1rem; }
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { text-align: left; padding: 0.8rem; border-bottom: 1px solid var(--color-border); }
.actions { display: flex; gap: 0.45rem; }
.actions button { border: 1px solid var(--color-border); border-radius: 8px; background: #fff; padding: 0.45rem 0.65rem; }
</style>
