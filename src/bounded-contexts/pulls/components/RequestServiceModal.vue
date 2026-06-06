<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Modal from '../../../shared/components/Modal.vue'
import Toast from '../../../shared/components/Toast.vue'
import PriceSuggestionPanel from './PriceSuggestionPanel.vue'
import { useEngagementStore } from '@pulls/stores/engagementStore'
import type { CreateProjectRequestPayload } from '@pulls/types/engagement.types'
import { normalizeError } from '@shared/utils/errorMapper'

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
const error = ref('')
const submitting = ref(false)
const attemptedSubmit = ref(false)

const resetFormState = () => {
  attemptedSubmit.value = false
  success.value = ''
  error.value = ''
  form.value = {
    serviceId: '',
    freelancerId: '',
    message: '',
    proposedPrice: 0,
    currency: 'PEN',
    proposedDeliveryDays: 7
  }
}

const validationErrors = computed(() => ({
  message: form.value.message.trim().length >= 10 ? '' : 'Enter at least 10 characters.',
  proposedPrice: form.value.proposedPrice > 0 ? '' : 'Enter a price greater than 0.',
  currency: form.value.currency.trim().length === 3 ? '' : 'Use a 3-letter currency code like PEN.',
  proposedDeliveryDays: form.value.proposedDeliveryDays > 0 ? '' : 'Enter at least 1 delivery day.'
}))

const isValid = computed(() => Object.values(validationErrors.value).every((message) => message === ''))

const submit = async () => {
  attemptedSubmit.value = true
  if (!isValid.value) {
    success.value = ''
    error.value = 'Please fix the highlighted fields before sending the request.'
    return
  }

  submitting.value = true
  error.value = ''
  success.value = ''
  try {
    const payload: CreateProjectRequestPayload = {
      serviceId: props.serviceId,
      freelancerId: props.freelancerId,
      message: form.value.message.trim(),
      proposedPrice: Number(form.value.proposedPrice),
      currency: form.value.currency.trim().toUpperCase(),
      proposedDeliveryDays: Number(form.value.proposedDeliveryDays)
    }

    await store.createProjectRequest(payload)
    success.value = 'Request sent successfully.'
    setTimeout(() => {
      emit('close')
      router.push('/client/requests')
    }, 450)
  } catch (e) {
    error.value = normalizeError(e).message
  } finally {
    submitting.value = false
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) {
      resetFormState()
    } else {
      form.value.serviceId = props.serviceId
      form.value.freelancerId = props.freelancerId
    }
  },
  { immediate: true }
)
</script>

<template>
  <Modal :open="open" title="Request Service" @close="emit('close')">
    <form class="form" @submit.prevent="submit">
      <Toast v-if="success" :message="success" type="success" />
      <Toast v-else-if="error" :message="error" type="error" />
      <label :class="{ invalid: attemptedSubmit && validationErrors.message }">
        <span>Message</span>
        <textarea v-model="form.message" rows="4" />
        <small v-if="attemptedSubmit && validationErrors.message" class="field-error">{{ validationErrors.message }}</small>
      </label>
      <label :class="{ invalid: attemptedSubmit && validationErrors.proposedPrice }">
        <span>Proposed Price</span>
        <input v-model.number="form.proposedPrice" min="1" step="0.01" type="number" />
        <small v-if="attemptedSubmit && validationErrors.proposedPrice" class="field-error">{{ validationErrors.proposedPrice }}</small>
      </label>
      <label :class="{ invalid: attemptedSubmit && validationErrors.currency }">
        <span>Currency</span>
        <input v-model="form.currency" maxlength="3" />
        <small v-if="attemptedSubmit && validationErrors.currency" class="field-error">{{ validationErrors.currency }}</small>
      </label>
      <label :class="{ invalid: attemptedSubmit && validationErrors.proposedDeliveryDays }">
        <span>Proposed Delivery Days</span>
        <input v-model.number="form.proposedDeliveryDays" min="1" type="number" />
        <small v-if="attemptedSubmit && validationErrors.proposedDeliveryDays" class="field-error">{{ validationErrors.proposedDeliveryDays }}</small>
      </label>
      <PriceSuggestionPanel @apply="(value) => (form.proposedPrice = value)" />
      <div class="actions">
        <button class="secondary" type="button" @click="emit('close')">Cancel</button>
        <button class="primary" type="submit" :disabled="submitting">{{ submitting ? 'Sending...' : 'Send Request' }}</button>
      </div>
    </form>
  </Modal>
</template>

<style scoped>
.form { display: grid; gap: 0.8rem; }
label { display: grid; gap: 0.35rem; }
input, textarea { border: 1px solid var(--color-border); border-radius: 8px; padding: 0.6rem 0.75rem; }
label.invalid input,
label.invalid textarea {
  border-color: #dc2626;
  box-shadow: 0 0 0 1px rgba(220, 38, 38, 0.18);
}
.field-error {
  color: #dc2626;
  font-size: 0.85rem;
  line-height: 1.2;
}
.actions { display: flex; justify-content: flex-end; gap: 0.5rem; }
.primary,
.secondary {
  border-radius: 8px;
  padding: 0.5rem 0.85rem;
  font-weight: 700;
  cursor: pointer;
}
.primary { border: none; background: var(--color-primary); color: #fff; }
.secondary { border: 1px solid var(--color-border); background: #fff; }
.primary:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}
</style>
