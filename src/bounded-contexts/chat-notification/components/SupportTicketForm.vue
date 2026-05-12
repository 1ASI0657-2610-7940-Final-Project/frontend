<script setup lang="ts">
import { ref } from 'vue'
import Toast from '../../../shared/components/Toast.vue'

const emit = defineEmits<{ submit: [payload: { subject: string; description: string }] }>()

const subject = ref('')
const description = ref('')
const success = ref('')

const submit = () => {
  if (!subject.value.trim() || !description.value.trim()) return
  emit('submit', { subject: subject.value, description: description.value })
  success.value = 'Ticket submitted. Our support team will respond shortly.'
  subject.value = ''
  description.value = ''
}
</script>

<template>
  <section class="card form">
    <Toast v-if="success" :message="success" type="success" />
    <label><span>Subject</span><input v-model="subject" placeholder="Briefly summarize your issue" /></label>
    <label><span>Description</span><textarea rows="7" v-model="description" placeholder="Provide details for faster support." /></label>
    <div class="actions"><button @click="submit">Submit Ticket</button></div>
  </section>
</template>

<style scoped>
.form { padding: 1rem; display: grid; gap: 0.8rem; }
label { display: grid; gap: 0.35rem; }
input, textarea { border: 1px solid var(--color-border); border-radius: 10px; padding: 0.65rem 0.75rem; }
.actions { display: flex; justify-content: flex-end; }
button { border: none; background: #0a66c2; color: #fff; border-radius: 8px; padding: 0.55rem 0.9rem; font-weight: 700; }
</style>
