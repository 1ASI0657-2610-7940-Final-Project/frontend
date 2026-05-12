<script setup lang="ts">
import { ref, watch } from 'vue'
import Modal from '../../../shared/components/Modal.vue'
import type { DecideRequestPayload } from '@pulls/types/engagement.types'

const props = defineProps<{ open: boolean; requestId: string; mode: 'ACCEPTED' | 'REJECTED' }>()
const emit = defineEmits<{ close: []; submit: [payload: DecideRequestPayload] }>()

const finalPrice = ref<number | undefined>()
const finalDeliveryDays = ref<number | undefined>()
const responseMessage = ref('')

watch(() => props.open, (isOpen) => {
  if (!isOpen) {
    finalPrice.value = undefined
    finalDeliveryDays.value = undefined
    responseMessage.value = ''
  }
})

const submit = () => {
  emit('submit', {
    decision: props.mode,
    finalPrice: props.mode === 'ACCEPTED' ? finalPrice.value : undefined,
    finalDeliveryDays: props.mode === 'ACCEPTED' ? finalDeliveryDays.value : undefined,
    responseMessage: responseMessage.value
  })
}
</script>

<template>
  <Modal :open="open" :title="mode === 'ACCEPTED' ? 'Accept Request' : 'Reject Request'" @close="emit('close')">
    <div class="form">
      <label v-if="mode === 'ACCEPTED'">
        <span>Final Price</span>
        <input type="number" v-model.number="finalPrice" />
      </label>
      <label v-if="mode === 'ACCEPTED'">
        <span>Final Delivery Days</span>
        <input type="number" v-model.number="finalDeliveryDays" />
      </label>
      <label>
        <span>Response Message</span>
        <textarea rows="4" v-model="responseMessage" />
      </label>
      <div class="actions">
        <button class="secondary" @click="emit('close')">Cancel</button>
        <button class="primary" @click="submit">Confirm</button>
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
