<script setup lang="ts">
import PriceRangeFilter from './PriceRangeFilter.vue'
import type { Category, ServiceFilters } from '@marketplace/types/marketplace.types'

const props = defineProps<{ modelValue: ServiceFilters; categories: Category[] }>()
const emit = defineEmits<{ 'update:modelValue': [value: ServiceFilters]; apply: [] }>()

const update = (partial: Partial<ServiceFilters>) => emit('update:modelValue', { ...props.modelValue, ...partial })

const toggleCategory = (name: string) => {
  const newCat = props.modelValue.category === name ? undefined : name
  update({ category: newCat, page: 1 })
}

const ratingOptions = [
  { label: '5.0', value: 5 },
  { label: '4.0 & up', value: 4 },
  { label: '3.0 & up', value: 3 },
]
</script>

<template>
  <aside class="filters card">
    <div class="section">
      <span class="section-label">SEARCH</span>
      <input
        :value="modelValue.q || ''"
        @input="update({ q: ($event.target as HTMLInputElement).value, page: 1 })"
        placeholder="Search for services..."
        class="text-input"
      />
    </div>

    <div class="section">
      <span class="section-label">CATEGORY</span>
      <ul class="option-list">
        <li v-for="cat in categories" :key="cat.id">
          <label class="option-item">
            <input
              type="checkbox"
              :checked="modelValue.category === cat.name"
              @change="toggleCategory(cat.name)"
              class="checkbox"
            />
            <span class="option-name">{{ cat.name }}</span>
          </label>
        </li>
      </ul>
    </div>

    <div class="section">
      <span class="section-label">PRICE RANGE (USD)</span>
      <PriceRangeFilter
        :price-min="modelValue.priceMin"
        :price-max="modelValue.priceMax"
        @min-change="(value) => update({ priceMin: value, page: 1 })"
        @max-change="(value) => update({ priceMax: value, page: 1 })"
      />
    </div>

    <div class="section">
      <span class="section-label">MINIMUM RATING</span>
      <ul class="option-list">
        <li v-for="opt in ratingOptions" :key="opt.value">
          <label class="option-item">
            <input
              type="radio"
              name="min-rating"
              :value="opt.value"
              :checked="modelValue.minRating === opt.value"
              @change="update({ minRating: opt.value, page: 1 })"
              class="radio"
            />
            <span>{{ opt.label }}</span>
          </label>
        </li>
      </ul>
    </div>

    <button class="apply" @click="emit('apply')">Apply Filters</button>
  </aside>
</template>

<style scoped>
.filters { padding: 1.25rem; display: flex; flex-direction: column; gap: 1.25rem; min-width: 0; }
.section { display: flex; flex-direction: column; gap: 0.6rem; }
.section-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; color: #64748b; }
.text-input { width: 100%; min-width: 0; border: 1px solid var(--color-border); border-radius: 8px; padding: 0.6rem 0.75rem; font-size: 0.875rem; box-sizing: border-box; }
.option-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.55rem; }
.option-item { display: flex; align-items: center; gap: 0.6rem; cursor: pointer; font-size: 0.875rem; color: #374151; }
.checkbox, .radio { accent-color: var(--color-primary); width: 15px; height: 15px; flex-shrink: 0; cursor: pointer; }
.option-name { flex: 1; }
.apply { border: none; border-radius: 8px; padding: 0.7rem; background: var(--color-primary); color: #fff; font-weight: 700; cursor: pointer; font-size: 0.875rem; }
</style>
