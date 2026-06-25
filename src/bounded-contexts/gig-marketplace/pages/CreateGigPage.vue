<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import GigForm from '../components/GigForm.vue'
import GigMediaManager from '../components/GigMediaManager.vue'
import PriceCalculatorPanel from '../components/PriceCalculatorPanel.vue'
import Toast from '../../../shared/components/Toast.vue'
import type { CreateServicePayload, ServiceMedia } from '@marketplace/types/marketplace.types'
import { useMarketplaceStore } from '@marketplace/stores/marketplaceStore'

const router = useRouter()
const store = useMarketplaceStore()

const form = ref<Partial<CreateServicePayload>>({ currency: 'PEN', tags: [], deliveryDays: 7 })
const serviceId = ref<string | null>(null)
const media = ref<ServiceMedia[]>([])
const busy = ref(false)
const message = ref('')
const selectedCategoryName = computed(
  () => store.categories.find((category) => category.id === form.value.categoryId)?.name || ''
)

const submit = async () => {
  busy.value = true
  message.value = ''
  try {
    const created = await store.createService(form.value as CreateServicePayload)
    serviceId.value = created.id
    message.value = 'Gig created. You can now upload media.'
  } finally {
    busy.value = false
  }
}

const uploadMedia = async (files: FileList) => {
  if (!serviceId.value) return
  busy.value = true
  try {
    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append('file', file)
      await store.uploadServiceMedia(serviceId.value, formData)
    }
    await store.fetchServiceById(serviceId.value)
    media.value = store.selectedService?.media || []
  } finally {
    busy.value = false
  }
}

const deleteMedia = async (mediaId: string) => {
  if (!serviceId.value) return
  await store.deleteServiceMedia(serviceId.value, mediaId)
  await store.fetchServiceById(serviceId.value)
  media.value = store.selectedService?.media || []
}

const finish = () => router.push('/freelancer/gigs')

onMounted(async () => {
  await store.fetchCategories()
})
</script>

<template>
  <section class="create-page">
    <h1 class="page-title">Let's set up your Gig</h1>
    <p class="muted">Define your service, set your terms, and showcase your expertise to potential clients.</p>
    <Toast v-if="message" :message="message" type="success" />
    <GigForm v-model="form" :categories="store.categories" submit-label="Create Gig" :busy="busy" @submit="submit" />
    <PriceCalculatorPanel
      :base-price="form.basePrice"
      :currency="form.currency"
      :category-name="selectedCategoryName"
      @apply-price="(value) => (form.basePrice = value)"
    />
    <GigMediaManager :media="media" :busy="busy" @upload="uploadMedia" @delete="deleteMedia" />
    <div class="actions">
      <button class="secondary" @click="finish">Done</button>
    </div>
  </section>
</template>

<style scoped>
.create-page { display: grid; gap: 0.9rem; max-width: 980px; }
.actions { display: flex; justify-content: flex-end; }
.secondary { border: 1px solid var(--color-primary); color: var(--color-primary); background: #fff; border-radius: 10px; padding: 0.65rem 1rem; font-weight: 700; cursor: pointer; }
</style>
