<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ServiceMedia } from '@marketplace/types/marketplace.types'

const props = defineProps<{ media: ServiceMedia[] }>()
const selected = ref(0)
const orderedMedia = computed(() => [...props.media].sort((a, b) => Number(b.primary) - Number(a.primary) || (a.sortOrder ?? 0) - (b.sortOrder ?? 0)))
watch(() => props.media, () => { selected.value = 0 })
const placeholder = 'https://via.placeholder.com/960x540?text=GigU+Service'
</script>

<template>
  <div class="gallery">
    <img class="hero" :src="orderedMedia[selected]?.url || placeholder" alt="service" />
    <div class="thumbs" v-if="orderedMedia.length">
      <button v-for="(item, index) in orderedMedia" :key="item.id" class="thumb-btn" :class="{ active: selected === index }" @click="selected = index">
        <img :src="item.url" alt="preview" />
      </button>
    </div>
    <div v-else class="empty-media">
      <img :src="placeholder" alt="No service images" />
      <p>No images available yet.</p>
    </div>
  </div>
</template>

<style scoped>
.gallery { display: grid; gap: 0.85rem; }
.hero { width: 100%; border-radius: 14px; border: 1px solid var(--color-border); height: 460px; object-fit: cover; }
.thumbs { display: flex; gap: 0.65rem; }
.thumb-btn { padding: 0; border: 2px solid transparent; border-radius: 10px; overflow: hidden; cursor: pointer; background: transparent; }
.thumb-btn.active { border-color: var(--color-primary); }
.thumb-btn img { width: 120px; height: 72px; object-fit: cover; display: block; }
.empty-media { display: grid; gap: 0.5rem; justify-items: center; color: var(--color-text-muted); }
.empty-media img { width: 100%; border-radius: 14px; border: 1px solid var(--color-border); height: 460px; object-fit: cover; }
</style>
