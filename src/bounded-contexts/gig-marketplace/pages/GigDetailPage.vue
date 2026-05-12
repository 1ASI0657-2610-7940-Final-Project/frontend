<script setup lang="ts">
import { computed, onMounted } from 'vue'
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
import { ref } from 'vue'
import { chatApi } from '@chat/api/chatApi'

const route = useRoute()
const router = useRouter()
const store = useMarketplaceStore()
const auth = useAuthStore()

const serviceId = computed(() => route.params.id as string)
const isClient = computed(() => auth.user?.role === 'CLIENT')
const isFreelancer = computed(() => auth.user?.role === 'FREELANCER')
const requestModalOpen = ref(false)

const openChat = async () => {
  if (!auth.isAuthenticated) {
    await router.push('/login')
    return
  }
  if (!store.selectedService) return
  const created = await chatApi.createConversation({
    participantId: store.selectedService.freelancer.id,
    projectId: undefined
  })
  await router.push(`/chat?conversationId=${created.id}`)
}

const openRequest = () => {
  if (!auth.isAuthenticated) {
    router.push('/login')
    return
  }
  requestModalOpen.value = true
}

onMounted(async () => {
  await store.fetchServiceById(serviceId.value)
})
</script>

<template>
  <section class="detail-page">
    <RouterLink class="back" to="/marketplace">? Back to Marketplace</RouterLink>

    <ErrorState v-if="store.error" :message="store.error" />
    <LoadingState v-else-if="store.loading" />

    <div v-else-if="store.selectedService" class="layout">
      <div class="main-col">
        <ServiceGallery :media="store.selectedService.media" />
        <h1 class="title">{{ store.selectedService.title }}</h1>
        <div class="meta-row">
          <span class="chip">{{ store.selectedService.category.name }}</span>
          <RatingBadge :rating="store.selectedService.freelancer.averageRating" />
          <span class="muted">({{ store.selectedService.freelancer.reviewsCount }} reviews)</span>
        </div>
        <div class="tags">
          <span v-for="tag in store.selectedService.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
        <h3>About this Service</h3>
        <p class="description">{{ store.selectedService.description }}</p>
      </div>

      <aside class="side-col">
        <section class="card panel">
          <h4>Base Price</h4>
          <p class="price">{{ formatCurrency(store.selectedService.basePrice, store.selectedService.currency) }}</p>
          <p class="muted">Estimated Delivery: {{ store.selectedService.deliveryDays }} days</p>
          <Button v-if="isClient" @click="openRequest">Request Service</Button>
          <Button v-else-if="isFreelancer" :disabled="true">Request Service</Button>
          <Button v-else @click="openRequest">Request Service</Button>
          <Button variant="secondary" @click="openChat">Open Chat</Button>
        </section>

        <section class="card panel">
          <h4>Service Provider</h4>
          <p class="provider">{{ store.selectedService.freelancer.displayName }}</p>
          <div class="rating-line">
            <RatingBadge :rating="store.selectedService.freelancer.averageRating" />
            <span class="muted">({{ store.selectedService.freelancer.reviewsCount || 0 }} reviews)</span>
          </div>
        </section>
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
.layout { display: grid; gap: 1.2rem; grid-template-columns: 1fr 360px; align-items: start; }
.back { color: #334155; font-weight: 600; }
.title { margin-top: 0.8rem; font-size: 3rem; line-height: 1.1; }
.meta-row { display: flex; align-items: center; gap: 0.6rem; margin: 0.75rem 0; }
.chip, .tag { border: 1px solid var(--color-border); border-radius: 999px; background: #f8faff; padding: 4px 10px; font-size: 13px; }
.tags { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; }
.description { color: #374151; font-size: 1.2rem; line-height: 1.7; }
.panel { padding: 1rem; display: grid; gap: 0.75rem; }
.price { margin: 0; font-size: 2.5rem; font-weight: 800; color: var(--color-primary); }
.provider { margin: 0; font-size: 1.5rem; font-weight: 700; }
.rating-line { display: flex; align-items: center; gap: 0.4rem; }
.side-col { display: grid; gap: 1rem; }
@media (max-width: 1060px) { .layout { grid-template-columns: 1fr; } .title { font-size: 2.2rem; } }
</style>
