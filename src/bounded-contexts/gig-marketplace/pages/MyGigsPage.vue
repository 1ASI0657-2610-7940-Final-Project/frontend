<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from '../../../shared/components/Button.vue'
import LoadingState from '../../../shared/components/LoadingState.vue'
import EmptyState from '../../../shared/components/EmptyState.vue'
import ErrorState from '../../../shared/components/ErrorState.vue'
import ServiceStatusBadge from '../components/ServiceStatusBadge.vue'
import { useMarketplaceStore } from '@marketplace/stores/marketplaceStore'
import { formatCurrency } from '../../../shared/utils/formatCurrency'

const router = useRouter()
const store = useMarketplaceStore()

const removeGig = async (id: string) => {
  const confirmed = window.confirm('Delete this gig?')
  if (!confirmed) return
  await store.deleteService(id)
  await store.fetchMyServices()
}

onMounted(async () => {
  await store.fetchMyServices()
})
</script>

<template>
  <section class="my-gigs">
    <header class="head">
      <div>
        <h1 class="page-title">My Gigs</h1>
        <p class="muted">Manage your service offerings, update pricing, and track status.</p>
      </div>
      <Button @click="router.push('/freelancer/gigs/new')">Create New Gig</Button>
    </header>

    <ErrorState v-if="store.error" :message="store.error" />
    <LoadingState v-else-if="store.loading" />
    <EmptyState v-else-if="store.myServices.length === 0" title="No gigs yet" message="Create your first gig to appear in the marketplace." />

    <div v-else class="card gigs-table">
      <div class="table-head table-grid">
        <div>Gig Details</div>
        <div>Status</div>
        <div>Price</div>
        <div>Actions</div>
      </div>

      <div class="table-body">
        <article v-for="gig in store.myServices" :key="gig.id" class="table-row table-grid">
          <div class="gig-cell">
            <img :src="gig.thumbnailUrl || 'https://via.placeholder.com/160x90?text=GigU'" alt="gig" />
            <div>
              <strong>{{ gig.title }}</strong>
              <div class="muted">ID: {{ gig.id }}</div>
            </div>
          </div>

          <div class="cell compact">
            <span class="mobile-label">Status:</span>
            <ServiceStatusBadge :status="gig.status" />
          </div>

          <div class="cell compact price">
            <span class="mobile-label">Price:</span>
            <span>{{ formatCurrency(gig.basePrice, gig.currency) }}</span>
          </div>

          <div class="cell actions">
            <span class="mobile-label">Actions:</span>
            <div class="actions-wrap">
              <button @click="router.push(`/freelancer/gigs/${gig.id}/edit`)">Edit</button>
              <button @click="router.push(`/freelancer/gigs/${gig.id}/edit`)">Upload Media</button>
              <button @click="removeGig(gig.id)">Delete</button>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.my-gigs { display: grid; gap: 1rem; }
.head { display: flex; justify-content: space-between; align-items: start; gap: 1rem; }
.gigs-table { overflow: hidden; }
.table-grid { display: grid; grid-template-columns: minmax(420px, 1fr) 130px 130px 300px; column-gap: 1rem; align-items: center; }
.table-head { padding: 0.95rem 1rem; border-bottom: 1px solid var(--color-border); font-weight: 700; }
.table-row { padding: 0.95rem 1rem; border-bottom: 1px solid var(--color-border); }
.table-row:last-child { border-bottom: none; }
.gig-cell { display: flex; align-items: center; gap: 0.8rem; }
.gig-cell img { width: 98px; height: 62px; object-fit: cover; border-radius: 8px; border: 1px solid var(--color-border); }
.gig-cell strong { font-size: 1.05rem; color: var(--color-neutral); }
.cell { min-width: 0; }
.price { font-weight: 600; color: #0f172a; }
.actions-wrap { display: flex; flex-wrap: wrap; gap: 0.45rem; }
.actions button { border: 1px solid var(--color-border); border-radius: 8px; padding: 0.4rem 0.6rem; background: white; cursor: pointer; white-space: nowrap; }
.mobile-label { display: none; font-size: 12px; color: var(--color-text-muted); font-weight: 600; margin-bottom: 0.2rem; }

@media (max-width: 1180px) {
  .table-grid { grid-template-columns: minmax(280px, 1fr) 110px 110px 220px; }
}

@media (max-width: 860px) {
  .table-head { display: none; }
  .table-row {
    grid-template-columns: 1fr;
    gap: 0.6rem;
    border: 1px solid var(--color-border);
    border-radius: 12px;
    margin: 0.8rem;
  }
  .mobile-label { display: inline-flex; }
  .gig-cell { align-items: flex-start; }
  .actions-wrap { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
