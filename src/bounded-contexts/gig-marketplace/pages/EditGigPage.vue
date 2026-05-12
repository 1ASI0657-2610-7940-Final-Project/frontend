<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import GigForm from '../components/GigForm.vue'
import GigMediaManager from '../components/GigMediaManager.vue'
import Toast from '../../../shared/components/Toast.vue'
import ErrorState from '../../../shared/components/ErrorState.vue'
import type { ServiceMedia, UpdateServicePayload } from '@marketplace/types/marketplace.types'
import { useMarketplaceStore } from '@marketplace/stores/marketplaceStore'

const route = useRoute()
const store = useMarketplaceStore()

const serviceId = computed(() => route.params.id as string)
const form = ref<Partial<UpdateServicePayload>>({})
const media = ref<ServiceMedia[]>([])
const busy = ref(false)
const success = ref('')

const hydrate = async () => {
  await Promise.all([store.fetchCategories(), store.fetchServiceById(serviceId.value)])
  if (!store.selectedService) return
  form.value = {
    title: store.selectedService.title,
    description: store.selectedService.description,
    basePrice: store.selectedService.basePrice,
    currency: store.selectedService.currency,
    categoryId: store.selectedService.category.id,
    deliveryDays: store.selectedService.deliveryDays,
    tags: store.selectedService.tags
  }
  media.value = store.selectedService.media
}

const submit = async () => {
  busy.value = true
  success.value = ''
  try {
    await store.updateService(serviceId.value, form.value)
    success.value = 'Gig updated successfully.'
  } finally {
    busy.value = false
  }
}

const uploadMedia = async (files: FileList) => {
  busy.value = true
  try {
    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append('file', file)
      await store.uploadServiceMedia(serviceId.value, formData)
    }
    await store.fetchServiceById(serviceId.value)
    media.value = store.selectedService?.media || []
    success.value = 'Media uploaded successfully.'
  } finally {
    busy.value = false
  }
}

const removeMedia = async (mediaId: string) => {
  await store.deleteServiceMedia(serviceId.value, mediaId)
  await store.fetchServiceById(serviceId.value)
  media.value = store.selectedService?.media || []
  success.value = 'Media removed successfully.'
}

onMounted(hydrate)
</script>

<template>
  <section class="edit-page">
    <h1 class="page-title">Edit Gig</h1>
    <p class="muted">Update your service details and assets.</p>
    <Toast v-if="success" :message="success" type="success" />
    <ErrorState v-if="store.error" :message="store.error" />
    <GigForm v-model="form" :categories="store.categories" submit-label="Save Changes" :busy="busy" @submit="submit" />
    <GigMediaManager :media="media" :busy="busy" @upload="uploadMedia" @delete="removeMedia" />
  </section>
</template>

<style scoped>
.edit-page { display: grid; gap: 0.9rem; max-width: 980px; }
</style>
