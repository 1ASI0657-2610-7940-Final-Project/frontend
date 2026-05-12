<script setup lang="ts">
import CategorySelect from './CategorySelect.vue'
import PriceRangeFilter from './PriceRangeFilter.vue'
import type { Category, ServiceFilters } from '@marketplace/types/marketplace.types'

const props = defineProps<{ modelValue: ServiceFilters; categories: Category[] }>()
const emit = defineEmits<{ 'update:modelValue': [value: ServiceFilters]; apply: [] }>()

const update = (partial: Partial<ServiceFilters>) => emit('update:modelValue', { ...props.modelValue, ...partial })
</script>

<template>
  <aside class="filters card">
    <h3>Filters</h3>
    <label class="field">
      <span>Search</span>
      <input :value="modelValue.q || ''" @input="update({ q: ($event.target as HTMLInputElement).value, page: 1 })" placeholder="Search services" />
    </label>
    <CategorySelect :model-value="modelValue.category || ''" :options="categories" @update:model-value="(value) => update({ category: value || undefined, page: 1 })" />
    <PriceRangeFilter :price-min="modelValue.priceMin" :price-max="modelValue.priceMax" @min-change="(value) => update({ priceMin: value, page: 1 })" @max-change="(value) => update({ priceMax: value, page: 1 })" />
    <label class="field">
      <span>Min Rating</span>
      <select :value="modelValue.minRating || ''" @change="update({ minRating: Number(($event.target as HTMLSelectElement).value) || undefined, page: 1 })">
        <option value="">Any</option>
        <option :value="5">5.0</option>
        <option :value="4">4.0+</option>
        <option :value="3">3.0+</option>
      </select>
    </label>
    <button class="apply" @click="emit('apply')">Apply Filters</button>
  </aside>
</template>

<style scoped>
.filters { padding: 1rem; display: grid; gap: 0.9rem; min-width: 0; }
h3 { margin: 0; font-size: 1.15rem; }
.field { display: grid; gap: 0.35rem; min-width: 0; }
span { font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 700; }
input, select { width: 100%; min-width: 0; border: 1px solid var(--color-border); border-radius: 10px; padding: 0.65rem 0.75rem; }
.apply { border: none; border-radius: 10px; padding: 0.65rem 0.9rem; background: var(--color-primary); color: #fff; font-weight: 700; cursor: pointer; }
</style>
