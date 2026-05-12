<script setup lang="ts">
import type { Category, CreateServicePayload, UpdateServicePayload } from '@marketplace/types/marketplace.types'

const props = defineProps<{ modelValue: Partial<CreateServicePayload & UpdateServicePayload>; categories: Category[]; submitLabel: string; busy?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: Partial<CreateServicePayload & UpdateServicePayload>]; submit: [] }>()

const update = (key: keyof (CreateServicePayload & UpdateServicePayload), value: unknown) => {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

const tagInput = (value: string) => {
  const tags = value.split(',').map((item) => item.trim()).filter(Boolean)
  update('tags', tags)
}
</script>

<template>
  <form class="gig-form card" @submit.prevent="emit('submit')">
    <h2>Gig Setup</h2>
    <div class="grid two">
      <label>
        <span>Title</span>
        <input :value="modelValue.title || ''" @input="update('title', ($event.target as HTMLInputElement).value)" required />
      </label>
      <label>
        <span>Category</span>
        <select :value="modelValue.categoryId || ''" @change="update('categoryId', ($event.target as HTMLSelectElement).value)" required>
          <option value="" disabled>Select category</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
        </select>
      </label>
    </div>
    <div class="grid two">
      <label>
        <span>Base Price</span>
        <input type="number" min="0" step="0.01" :value="modelValue.basePrice ?? ''" @input="update('basePrice', Number(($event.target as HTMLInputElement).value))" required />
      </label>
      <label>
        <span>Currency</span>
        <input :value="modelValue.currency || 'PEN'" @input="update('currency', ($event.target as HTMLInputElement).value)" required />
      </label>
    </div>
    <label>
      <span>Delivery Days</span>
      <input type="number" min="1" :value="modelValue.deliveryDays ?? ''" @input="update('deliveryDays', Number(($event.target as HTMLInputElement).value))" required />
    </label>
    <label>
      <span>Description</span>
      <textarea rows="6" :value="modelValue.description || ''" @input="update('description', ($event.target as HTMLTextAreaElement).value)" required />
    </label>
    <label>
      <span>Tags</span>
      <input :value="(modelValue.tags || []).join(', ')" @input="tagInput(($event.target as HTMLInputElement).value)" placeholder="Vue, Landing Page, Responsive" />
    </label>
    <button class="submit" :disabled="busy">{{ busy ? 'Saving...' : submitLabel }}</button>
  </form>
</template>

<style scoped>
.gig-form { padding: 1.25rem; display: grid; gap: 1rem; }
.grid.two { display: grid; gap: 0.8rem; grid-template-columns: repeat(2, minmax(0, 1fr)); }
label { display: grid; gap: 0.35rem; }
span { font-size: 13px; font-weight: 700; }
input, select, textarea { border: 1px solid var(--color-border); border-radius: 10px; padding: 0.7rem 0.8rem; }
.submit { justify-self: end; border: none; border-radius: 10px; padding: 0.7rem 1.2rem; background: var(--color-primary); color: #fff; font-weight: 700; cursor: pointer; }
@media (max-width: 820px) { .grid.two { grid-template-columns: 1fr; } }
</style>
