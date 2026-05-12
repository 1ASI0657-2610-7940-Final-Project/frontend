<script setup lang="ts">
import { ref } from 'vue'
import Modal from '../../../shared/components/Modal.vue'
import Toast from '../../../shared/components/Toast.vue'
import { chatApi } from '@chat/api/chatApi'

const props = defineProps<{ open: boolean; reportedUserId: string }>()
const emit = defineEmits<{ close: [] }>()

const reason = ref('INAPPROPRIATE_BEHAVIOR')
const description = ref('')
const success = ref('')

const submit = async () => {
  if (!description.value.trim()) return
  await chatApi.reportUser({ reportedUserId: props.reportedUserId, reason: reason.value, description: description.value })
  success.value = 'Report submitted successfully.'
  setTimeout(() => emit('close'), 450)
}
</script>

<template>
  <Modal :open="open" title="Report User" @close="emit('close')">
    <div class="form">
      <Toast v-if="success" :message="success" type="success" />
      <label>
        <span>Reason</span>
        <select v-model="reason">
          <option value="INAPPROPRIATE_BEHAVIOR">Inappropriate Behavior</option>
          <option value="SPAM">Spam</option>
          <option value="HARASSMENT">Harassment</option>
        </select>
      </label>
      <label>
        <span>Description</span>
        <textarea rows="4" v-model="description" />
      </label>
      <div class="actions">
        <button class="secondary" @click="emit('close')">Cancel</button>
        <button class="primary" @click="submit">Submit Report</button>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.form { display: grid; gap: 0.8rem; }
label { display: grid; gap: 0.35rem; }
select, textarea { border: 1px solid var(--color-border); border-radius: 8px; padding: 0.6rem 0.75rem; }
.actions { display: flex; justify-content: flex-end; gap: 0.5rem; }
.primary, .secondary { border-radius: 8px; padding: 0.5rem 0.85rem; font-weight: 700; }
.primary { border: none; background: var(--color-primary); color: #fff; }
.secondary { border: 1px solid var(--color-border); background: #fff; }
</style>
