<script setup lang="ts">
import { ref, watch } from 'vue'
import Modal from '../../../shared/components/Modal.vue'
import type { ProjectStatus, UpdateProjectStatusPayload } from '@pulls/types/engagement.types'

const props = defineProps<{ open: boolean; options: ProjectStatus[] }>()
const emit = defineEmits<{ close: []; submit: [payload: UpdateProjectStatusPayload] }>()

const status = ref<ProjectStatus>('IN_PROGRESS')
const comment = ref('')

watch(() => props.open, (isOpen) => {
  if (isOpen && props.options.length) status.value = props.options[0]
})
</script>

<template>
  <Modal :open="open" title="Update Project Status" @close="emit('close')">
    <div class="form">
      <label>
        <span>Status</span>
        <select v-model="status">
          <option v-for="option in options" :key="option" :value="option">{{ option }}</option>
        </select>
      </label>
      <label>
        <span>Comment</span>
        <textarea rows="4" v-model="comment" />
      </label>
      <div class="actions">
        <button class="secondary" @click="emit('close')">Cancel</button>
        <button class="primary" @click="emit('submit', { status, comment })">Update</button>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.form { display: grid; gap: 0.8rem; }
label { display: grid; gap: 0.35rem; }
select, textarea { border: 1px solid var(--color-border); border-radius: 8px; padding: 0.6rem 0.75rem; }
.actions { display: flex; justify-content: flex-end; gap: 0.5rem; }
.primary, .secondary { border-radius: 8px; padding: 0.5rem 0.85rem; font-weight: 700; cursor: pointer; }
.primary { border: none; background: var(--color-primary); color: #fff; }
.secondary { border: 1px solid var(--color-border); background: #fff; }
</style>
