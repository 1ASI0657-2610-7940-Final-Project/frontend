<script setup lang="ts">
import { computed, ref } from 'vue'
import Modal from '../../../shared/components/Modal.vue'
import Toast from '../../../shared/components/Toast.vue'
import { apiClients, http } from '../../../shared/api/httpClient'

const props = defineProps<{ open: boolean; serviceId: string; freelancerId: string }>()
const emit = defineEmits<{ close: [] }>()

const message = ref('')
const price = ref<number | null>(null)
const currency = ref('PEN')
const deliveryDays = ref(7)
const busy = ref(false)
const success = ref('')
const error = ref('')

const valid = computed(() => message.value.trim().length >= 10 && Number(price.value) > 0 && deliveryDays.value > 0)

const submit = async () => {
  if (!valid.value) {
    error.value = 'Complete the required fields before sending the request.'
    return
  }
  busy.value = true
  error.value = ''
  success.value = ''
  try {
    await http.post(apiClients.pulls, '/requests', {
      serviceId: props.serviceId,
      freelancerId: props.freelancerId,
      message: message.value.trim(),
      proposedPrice: Number(price.value),
      currency: currency.value.trim().toUpperCase(),
      proposedDeliveryDays: Number(deliveryDays.value)
    })
    success.value = 'Request sent successfully.'
    emit('close')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unable to send request.'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <Modal :open="open" title="Request Service" @close="emit('close')">
    <div class="form">
      <Toast v-if="success" :message="success" type="success" />
      <Toast v-else-if="error" :message="error" type="error" />

      <label>
        <span>Message</span>
        <textarea v-model="message" rows="4" />
      </label>
      <label>
        <span>Proposed Price</span>
        <input v-model.number="price" type="number" min="1" step="0.01" />
      </label>
      <label>
        <span>Currency</span>
        <input v-model="currency" maxlength="3" />
      </label>
      <label>
        <span>Proposed Delivery Days</span>
        <input v-model.number="deliveryDays" type="number" min="1" />
      </label>

      <div class="actions">
        <button type="button" class="secondary" @click="emit('close')">Cancel</button>
        <button type="button" class="primary" :disabled="busy || !valid" @click="submit">{{ busy ? 'Sending...' : 'Send Request' }}</button>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.form {
  display: grid;
  gap: 0.85rem;
}
label {
  display: grid;
  gap: 0.35rem;
}
textarea,
input {
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 0.7rem 0.85rem;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
.primary,
.secondary {
  border-radius: 10px;
  padding: 0.6rem 0.9rem;
  font-weight: 700;
  cursor: pointer;
}
.primary {
  border: none;
  background: var(--color-primary);
  color: #fff;
}
.secondary {
  border: 1px solid var(--color-border);
  background: #fff;
}
</style>
