<script setup lang="ts">
defineProps<{ priceMin?: number; priceMax?: number }>()
defineEmits<{ minChange: [value: number | undefined]; maxChange: [value: number | undefined] }>()

const parseValue = (value: string) => {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}
</script>

<template>
  <div class="range">
    <label>
      <span>Min</span>
      <input type="number" :value="priceMin" @input="$emit('minChange', parseValue(($event.target as HTMLInputElement).value))" />
    </label>
    <label>
      <span>Max</span>
      <input type="number" :value="priceMax" @input="$emit('maxChange', parseValue(($event.target as HTMLInputElement).value))" />
    </label>
  </div>
</template>

<style scoped>
.range { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; min-width: 0; }
label { display: grid; gap: 0.35rem; min-width: 0; }
span { font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 700; }
input { width: 100%; min-width: 0; border: 1px solid var(--color-border); border-radius: 10px; padding: 0.65rem 0.75rem; }
</style>
