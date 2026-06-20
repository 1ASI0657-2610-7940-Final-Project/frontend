<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ServiceGallery from '../components/ServiceGallery.vue'
import RatingBadge from '../components/RatingBadge.vue'
import Button from '../../../shared/components/Button.vue'
import LoadingState from '../../../shared/components/LoadingState.vue'
import ErrorState from '../../../shared/components/ErrorState.vue'
import RequestServiceModal from '@pulls/components/RequestServiceModal.vue'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { useMarketplaceStore } from '@marketplace/stores/marketplaceStore'
import { useAuthStore } from '../../../app/stores/authStore'
import { chatApi } from '@chat/api/chatApi'

const route = useRoute()
const router = useRouter()
const store = useMarketplaceStore()
const auth = useAuthStore()

const serviceId = computed(() => route.params.id as string)
const isFreelancer = computed(() => auth.user?.role === 'FREELANCER')
const requestModalOpen = ref(false)

const initials = computed(() => {
  const name = store.selectedService?.freelancer.displayName || ''
  return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
})

const descriptionParagraphs = computed(() =>
  (store.selectedService?.description || '').split('\n').filter(p => p.trim())
)

const openChat = async () => {
  if (!auth.isAuthenticated) { await router.push('/login'); return }
  if (!store.selectedService) return
  const created = await chatApi.createConversation({ participantId: store.selectedService.freelancer.id, projectId: undefined })
  await router.push(`/chat?conversationId=${created.id}`)
}

const openRequest = () => {
  if (!auth.isAuthenticated) { router.push('/login'); return }
  requestModalOpen.value = true
}

onMounted(async () => {
  await store.fetchServiceById(serviceId.value)
})
</script>

<template>
  <section class="detail-page">
    <RouterLink class="back" to="/marketplace">← Back to Marketplace</RouterLink>

    <ErrorState v-if="store.error" :message="store.error" />
    <LoadingState v-else-if="store.loading" />

    <div v-else-if="store.selectedService" class="layout">
      <!-- LEFT COLUMN -->
      <div class="main-col">
        <ServiceGallery :media="store.selectedService.media" />

        <div class="meta-row">
          <span class="chip">{{ store.selectedService.category.name }}</span>
          <RatingBadge :rating="store.selectedService.freelancer.averageRating" />
          <span class="muted review-count">({{ store.selectedService.freelancer.reviewsCount }} reviews)</span>
        </div>

        <h1 class="title">{{ store.selectedService.title }}</h1>

        <div class="tags" v-if="store.selectedService.tags.length">
          <span v-for="tag in store.selectedService.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>

        <hr class="section-divider" />

        <h3 class="about-heading">About this Service</h3>
        <div class="description">
          <p v-if="descriptionParagraphs.length === 0">{{ store.selectedService.description }}</p>
          <p v-for="(para, i) in descriptionParagraphs" :key="i">{{ para }}</p>
        </div>
      </div>

      <!-- RIGHT SIDEBAR -->
      <aside class="side-col">
        <div class="card panel">
          <!-- Price section -->
          <div class="price-section">
            <div class="price-header-row">
              <span class="panel-label">BASE PRICE</span>
              <button class="bookmark-btn" title="Save service">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
              </button>
            </div>
            <div class="price-display">
              <span class="price-amount">{{ formatCurrency(store.selectedService.basePrice, store.selectedService.currency) }}</span>
              <span class="price-currency">{{ store.selectedService.currency }}</span>
            </div>
            <div class="delivery-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Estimated Delivery: {{ store.selectedService.deliveryDays }} Days
            </div>
            <p class="price-note muted">Price may vary based on the complexity of the dataset and specific deliverable requirements.</p>
            <Button class="full-w" v-if="!isFreelancer" @click="openRequest">Request Service →</Button>
            <Button class="full-w" v-else :disabled="true">Request Service →</Button>
          </div>

          <hr class="panel-divider" />

          <!-- Provider section -->
          <div class="provider-section">
            <span class="panel-label">SERVICE PROVIDER</span>
            <div class="provider-row">
              <div class="avatar">{{ initials }}</div>
              <div class="provider-meta">
                <span class="provider-name">{{ store.selectedService.freelancer.displayName }}</span>
                <span class="verified">
                  <span class="verified-dot"></span>
                  Identity Verified
                </span>
              </div>
            </div>
            <Button variant="secondary" class="full-w chat-btn" @click="openChat">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Open Chat
            </Button>
          </div>
        </div>
      </aside>
    </div>

    <RequestServiceModal
      v-if="store.selectedService"
      :open="requestModalOpen"
      :service-id="store.selectedService.id"
      :freelancer-id="store.selectedService.freelancer.id"
      @close="requestModalOpen = false"
    />
  </section>
</template>

<style scoped>
.detail-page { display: grid; gap: 1rem; }
.back { display: inline-flex; align-items: center; gap: 0.3rem; color: #64748b; font-size: 0.875rem; font-weight: 500; text-decoration: none; }
.back:hover { color: #334155; }

.layout { display: grid; gap: 1.5rem; grid-template-columns: 1fr 340px; align-items: start; }

/* Main column */
.main-col { display: flex; flex-direction: column; }
.meta-row { display: flex; align-items: center; gap: 0.6rem; margin: 1rem 0 0.4rem; }
.chip { border: 1px solid #c7d7fd; border-radius: 999px; background: #eef2ff; padding: 3px 12px; font-size: 12px; font-weight: 600; color: var(--color-primary); }
.review-count { font-size: 0.875rem; }
.title { margin: 0.2rem 0 0.75rem; font-size: 2.35rem; line-height: 1.15; font-weight: 800; color: #0f172a; }
.tags { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.75rem; }
.tag { border: 1px solid var(--color-border); border-radius: 999px; background: #f8faff; padding: 4px 12px; font-size: 12px; color: #374151; }
.section-divider { border: none; border-top: 1px solid var(--color-border); margin: 0.5rem 0 1.25rem; }
.about-heading { margin: 0 0 0.75rem; font-size: 1rem; font-weight: 700; color: #0f172a; }
.description { display: flex; flex-direction: column; gap: 0.85rem; }
.description p { margin: 0; color: #374151; font-size: 0.925rem; line-height: 1.75; }

/* Side panel */
.side-col { position: sticky; top: 1.5rem; }
.panel { padding: 1.25rem; display: flex; flex-direction: column; gap: 0; }

.price-section { display: flex; flex-direction: column; gap: 0.8rem; padding-bottom: 1.25rem; }
.price-header-row { display: flex; justify-content: space-between; align-items: center; }
.panel-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; color: #94a3b8; }
.bookmark-btn { background: none; border: none; cursor: pointer; color: #94a3b8; padding: 0; display: flex; align-items: center; }
.bookmark-btn:hover { color: var(--color-primary); }
.price-display { display: flex; align-items: baseline; gap: 0.4rem; }
.price-amount { font-size: 2.1rem; font-weight: 800; color: #0f172a; }
.price-currency { font-size: 0.875rem; font-weight: 600; color: #64748b; }
.delivery-badge { display: flex; align-items: center; gap: 0.5rem; background: #f0f4ff; border: 1px solid #c7d7fd; border-radius: 8px; padding: 0.55rem 0.75rem; font-size: 0.8rem; color: #3b5bdb; font-weight: 500; }
.price-note { font-size: 0.78rem; margin: 0; line-height: 1.55; }

.panel-divider { border: none; border-top: 1px solid var(--color-border); margin: 0; }

.provider-section { display: flex; flex-direction: column; gap: 0.8rem; padding-top: 1.25rem; }
.provider-row { display: flex; align-items: center; gap: 0.75rem; }
.avatar { width: 44px; height: 44px; border-radius: 50%; background: var(--color-primary); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.875rem; flex-shrink: 0; }
.provider-meta { display: flex; flex-direction: column; gap: 0.2rem; }
.provider-name { font-weight: 700; font-size: 0.95rem; color: #0f172a; }
.verified { display: flex; align-items: center; gap: 0.35rem; font-size: 0.75rem; color: #64748b; }
.verified-dot { width: 7px; height: 7px; border-radius: 50%; background: #22c55e; flex-shrink: 0; }
.full-w { width: 100%; }
.chat-btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; }

@media (max-width: 1060px) { .layout { grid-template-columns: 1fr; } .side-col { position: static; } .title { font-size: 1.75rem; } }
</style>
