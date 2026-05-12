<script setup lang="ts">
import { ref } from 'vue'
import type { ServiceMedia } from '@marketplace/types/marketplace.types'

const props = defineProps<{ media: ServiceMedia[]; busy?: boolean }>()
const emit = defineEmits<{ upload: [files: FileList]; delete: [id: string] }>()
const preview = ref<string[]>([])

const onFile = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (!files || files.length === 0) return
  preview.value = Array.from(files).map((file) => URL.createObjectURL(file))
  emit('upload', files)
}
</script>

<template>
  <section class="card media-box">
    <div class="head">
      <h3>Project Portfolio</h3>
      <label class="upload-btn">
        Upload Images
        <input type="file" accept="image/*" multiple @change="onFile" :disabled="busy" />
      </label>
    </div>
    <div class="previews" v-if="preview.length">
      <img v-for="src in preview" :key="src" :src="src" alt="preview" />
    </div>
    <div class="previews" v-if="media.length">
      <div class="item" v-for="item in media" :key="item.id">
        <img :src="item.url" alt="media" />
        <button type="button" @click="emit('delete', item.id)">Delete</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.media-box { padding: 1.25rem; margin-top: 1rem; }
.head { display: flex; justify-content: space-between; align-items: center; gap: 0.8rem; }
.upload-btn { border: 1px solid var(--color-primary); color: var(--color-primary); border-radius: 8px; padding: 0.45rem 0.8rem; font-weight: 700; cursor: pointer; }
.upload-btn input { display: none; }
.previews { margin-top: 0.85rem; display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0.75rem; }
.previews img { width: 100%; height: 116px; object-fit: cover; border-radius: 10px; border: 1px solid var(--color-border); }
.item { display: grid; gap: 0.45rem; }
.item button { border: 1px solid #f4c2c2; background: #fff0f0; color: #b42318; border-radius: 8px; padding: 0.4rem 0.6rem; cursor: pointer; font-weight: 600; }
</style>
