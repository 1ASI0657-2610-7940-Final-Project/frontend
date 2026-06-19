<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { ServiceMedia } from '@marketplace/types/marketplace.types'

const props = defineProps<{
  media: ServiceMedia[]
  busy?: boolean
  statusType?: 'idle' | 'success' | 'error'
  statusMessage?: string
}>()
const emit = defineEmits<{ upload: [files: File[]]; delete: [id: string] }>()

const selectedFiles = ref<File[]>([])
const previewUrls = ref<string[]>([])
const localError = ref('')

const orderedMedia = computed(() => [...props.media].sort((a, b) => Number(b.primary) - Number(a.primary) || (a.sortOrder ?? 0) - (b.sortOrder ?? 0)))

const clearSelection = () => {
  previewUrls.value.forEach((url) => URL.revokeObjectURL(url))
  previewUrls.value = []
  selectedFiles.value = []
}

const onFileChange = (event: Event) => {
  localError.value = ''
  const files = Array.from((event.target as HTMLInputElement).files ?? [])
  if (!files.length) return
  clearSelection()
  selectedFiles.value = files
  previewUrls.value = files.map((file) => URL.createObjectURL(file))
}

const upload = () => {
  if (props.busy) return
  if (!selectedFiles.value.length) {
    localError.value = 'Select at least one image before uploading.'
    return
  }
  if (orderedMedia.value.length + selectedFiles.value.length > 5) {
    localError.value = 'A gig can have at most 5 images.'
    return
  }
  emit('upload', [...selectedFiles.value])
}

watch(
  () => props.statusType,
  (statusType) => {
    if (statusType === 'success') {
      clearSelection()
      localError.value = ''
    }
  }
)

onBeforeUnmount(() => clearSelection())
</script>

<template>
  <section class="card media-box">
    <div class="head">
      <div>
        <h3>Project Portfolio</h3>
        <p class="muted">Upload, preview, and manage the images that represent this gig.</p>
      </div>
      <label class="upload-btn" :class="{ disabled: busy }">
        Choose Images
        <input type="file" accept="image/jpeg,image/png,image/webp" multiple @change="onFileChange" :disabled="busy" />
      </label>
    </div>

    <div v-if="statusMessage" class="status" :class="statusType">
      {{ statusMessage }}
    </div>
    <div v-if="localError" class="status error">
      {{ localError }}
    </div>

    <div v-if="previewUrls.length" class="section">
      <div class="section-head">
        <h4>New selections</h4>
        <button class="link-btn" type="button" :disabled="busy" @click="clearSelection">Clear</button>
      </div>
      <div class="previews">
        <img v-for="src in previewUrls" :key="src" :src="src" alt="preview" />
      </div>
      <div class="upload-actions">
        <button class="primary" type="button" :disabled="busy" @click="upload">{{ busy ? 'Uploading...' : 'Upload Images' }}</button>
      </div>
    </div>

    <div v-if="orderedMedia.length" class="section">
      <div class="section-head">
        <h4>Current images</h4>
        <span class="muted">{{ orderedMedia.length }} / 5</span>
      </div>
      <div class="previews">
        <div class="item" v-for="item in orderedMedia" :key="item.id">
          <img :src="item.url" :alt="item.primary ? 'Primary gig image' : 'Gig image'" />
          <div class="item-meta">
            <span class="badge" :class="{ primary: item.primary }">{{ item.primary ? 'Primary' : 'Image' }}</span>
            <button type="button" class="delete-btn" :disabled="busy" @click="emit('delete', item.id)">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.media-box { padding: 1.25rem; margin-top: 1rem; display: grid; gap: 1rem; }
.head { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.8rem; }
.head h3, .section h4 { margin: 0; }
.head p { margin: 0.25rem 0 0; }
.upload-btn { border: 1px solid var(--color-primary); color: var(--color-primary); border-radius: 8px; padding: 0.55rem 0.9rem; font-weight: 700; cursor: pointer; background: #fff; display: inline-flex; align-items: center; gap: 0.4rem; }
.upload-btn input { display: none; }
.upload-btn.disabled { opacity: 0.6; cursor: not-allowed; }
.status { border-radius: 10px; padding: 0.7rem 0.85rem; font-weight: 600; }
.status.success { background: #ecfdf3; color: #027a48; border: 1px solid #abefc6; }
.status.error { background: #fef3f2; color: #b42318; border: 1px solid #fecdca; }
.status.idle { background: #f8fafc; color: #334155; border: 1px solid var(--color-border); }
.section { display: grid; gap: 0.75rem; }
.section-head { display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; }
.previews { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0.75rem; }
.previews img { width: 100%; height: 116px; object-fit: cover; border-radius: 10px; border: 1px solid var(--color-border); background: #f8fafc; }
.item { display: grid; gap: 0.5rem; }
.item-meta { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; }
.badge { font-size: 12px; border-radius: 999px; padding: 0.28rem 0.6rem; background: #f8fafc; color: #334155; border: 1px solid var(--color-border); }
.badge.primary { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
.delete-btn, .primary, .link-btn { border-radius: 8px; padding: 0.48rem 0.8rem; font-weight: 700; cursor: pointer; }
.delete-btn { border: 1px solid #f4c2c2; background: #fff0f0; color: #b42318; }
.primary { border: none; background: var(--color-primary); color: #fff; }
.link-btn { border: none; background: transparent; color: var(--color-primary); padding-inline: 0; }
.delete-btn:disabled, .primary:disabled, .link-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.upload-actions { display: flex; justify-content: flex-end; }
</style>
