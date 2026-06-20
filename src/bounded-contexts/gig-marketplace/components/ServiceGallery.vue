<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ServiceMedia } from '@marketplace/types/marketplace.types'

const props = defineProps<{ media: ServiceMedia[] }>()
const selected = ref(0)
const orderedMedia = computed(() => [...props.media].sort((a, b) => Number(b.primary) - Number(a.primary) || (a.sortOrder ?? 0) - (b.sortOrder ?? 0)))
watch(() => props.media, () => { selected.value = 0 })

const placeholder = 'https://placehold.co/960x540/e8edf5/94a3b8?text=GigU'
const heroSrc = computed(() => orderedMedia.value[selected.value]?.url || placeholder)
</script>

<template>
  <div class="gallery">
    <img class="hero" :src="heroSrc" alt="service image" />
    <div class="thumbs" v-if="orderedMedia.length > 0">
      <button
        v-for="(item, index) in orderedMedia"
        :key="item.id"
        class="thumb-btn"
        :class="{ active: selected === index }"
        @click="selected = index"
      >
        <img :src="item.url" alt="preview" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.gallery { display: grid; gap: 0.85rem; }
.hero { width: 100%; border-radius: 14px; border: 1px solid var(--color-border); height: 420px; object-fit: cover; display: block; background: #e8edf5; }
.thumbs { display: flex; gap: 0.65rem; }
.thumb-btn { padding: 0; border: 2px solid transparent; border-radius: 10px; overflow: hidden; cursor: pointer; background: transparent; transition: border-color 0.15s; }
.thumb-btn.active { border-color: var(--color-primary); }
.thumb-btn img { width: 110px; height: 68px; object-fit: cover; display: block; }
</style>
