<script setup lang="ts">
import { onMounted } from 'vue'
import { useEngagementStore } from '@pulls/stores/engagementStore'
import RequestStatusBadge from '../components/RequestStatusBadge.vue'
import EmptyState from '../../../shared/components/EmptyState.vue'
import LoadingState from '../../../shared/components/LoadingState.vue'
import ErrorState from '../../../shared/components/ErrorState.vue'
import { formatDate } from '../../../shared/utils/formatDate'

const store = useEngagementStore()
onMounted(async () => { await store.fetchOutgoingRequests() })
</script>

<template>
  <section class="page">
    <h1 class="page-title">My Requests</h1>
    <p class="muted">Track your outgoing service requests.</p>

    <ErrorState v-if="store.error" :message="store.error" />
    <LoadingState v-else-if="store.loading" />
    <EmptyState v-else-if="!store.outgoingRequests.length" title="No requests yet" message="Send your first request from a service detail page." />

    <div class="card table-wrap" v-else>
      <table>
        <thead><tr><th>Request</th><th>Price</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>
          <tr v-for="item in store.outgoingRequests" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.proposedPrice }} {{ item.currency }}</td>
            <td><RequestStatusBadge :status="item.status" /></td>
            <td>{{ formatDate(item.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.page { display: grid; gap: 1rem; }
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { text-align: left; padding: 0.8rem; border-bottom: 1px solid var(--color-border); }
</style>
