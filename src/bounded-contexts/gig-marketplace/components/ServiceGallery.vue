<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ServiceMedia } from '@marketplace/types/marketplace.types'

const props = defineProps<{ media: ServiceMedia[] }>()
const selected = ref(0)
watch(() => props.media, () => { selected.value = 0 })
</script>

<template>
  <div class="gallery">
    <img class="hero" :src="media[selected]?.url || 'https://via.placeholder.com/960x540?text=GigU+Service'" alt="service" />
    <div class="thumbs">
      <button v-for="(item, index) in media" :key="item.id" class="thumb-btn" :class="{ active: selected === index }" @click="selected = index">
        <img :src="item.url" alt="preview" />
      </button>
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
</style>
