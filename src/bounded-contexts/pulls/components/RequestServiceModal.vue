<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import Modal from '../../../shared/components/Modal.vue'
import Toast from '../../../shared/components/Toast.vue'
import PriceSuggestionPanel from './PriceSuggestionPanel.vue'
import { useEngagementStore } from '@pulls/stores/engagementStore'
import type { CreateProjectRequestPayload } from '@pulls/types/engagement.types'

const props = defineProps<{ open: boolean; serviceId: string; freelancerId: string }>()
const emit = defineEmits<{ close: [] }>()
const router = useRouter()
const store = useEngagementStore()

const form = ref<CreateProjectRequestPayload>({
  serviceId: '',
  freelancerId: '',
  message: '',
  proposedPrice: 0,
  currency: 'PEN',
  proposedDeliveryDays: 7
})
const success = ref('')

const valid = computed(() => form.value.message.trim().length >= 10 && form.value.proposedPrice > 0 && form.value.proposedDeliveryDays > 0)

const submit = async () => {
  if (!valid.value) return
  await store.createProjectRequest({ ...form.value, serviceId: props.serviceId, freelancerId: props.freelancerId })
  success.value = 'Request sent successfully.'
  setTimeout(() => {
    emit('close')
    router.push('/client/requests')
  }, 450)
}
</script>

<template>
  <Modal :open="open" title="Request Service" @close="emit('close')">
    <div class="form">
      <Toast v-if="success" :message="success" type="success" />
      <label><span>Message</span><textarea rows="4" v-model="form.message" /></label>
      <label><span>Proposed Price</span><input type="number" min="1" step="0.01" v-model.number="form.proposedPrice" /></label>
      <label><span>Currency</span><input v-model="form.currency" /></label>
      <label><span>Proposed Delivery Days</span><input type="number" min="1" v-model.number="form.proposedDeliveryDays" /></label>
      <PriceSuggestionPanel @apply="(value) => (form.proposedPrice = value)" />
      <div class="actions">
        <button class="secondary" @click="emit('close')">Cancel</button>
        <button class="primary" :disabled="!valid" @click="submit">Send Request</button>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.form { display: grid; gap: 0.8rem; }
label { display: grid; gap: 0.35rem; }
input, textarea { border: 1px solid var(--color-border); border-radius: 8px; padding: 0.6rem 0.75rem; }
.actions { display: flex; justify-content: flex-end; gap: 0.5rem; }
.primary, .secondary { border-radius: 8px; padding: 0.5rem 0.85rem; font-weight: 700; cursor: pointer; }
.primary { border: none; background: var(--color-primary); color: #fff; }
.secondary { border: 1px solid var(--color-border); background: #fff; }
</style>
