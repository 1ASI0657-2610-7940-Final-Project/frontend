<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  basePrice?: number | null
  deliveryDays?: number | null
  currency?: string
}>()

const currencyLabel = computed(() => (props.currency || 'PEN').trim().toUpperCase())

const safePrice = computed(() => {
  const value = Number(props.basePrice)
  return Number.isFinite(value) && value > 0 ? value : 0
})

const deliveryMultiplier = computed(() => {
  const days = Number(props.deliveryDays)
  if (!Number.isFinite(days) || days <= 0) return 1
  if (days <= 3) return 1.18
  if (days <= 7) return 1.1
  if (days <= 14) return 1.05
  return 1
})

const suggestedQuote = computed(() => safePrice.value * deliveryMultiplier.value)
const serviceFee = computed(() => suggestedQuote.value * 0.12)
const netEarnings = computed(() => suggestedQuote.value - serviceFee.value)

const formatMoney = (value: number) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
</script>

<template>
  <section class="card calculator-card">
    <div class="card-head">
      <div>
        <h3>Price Calculator</h3>
        <p class="muted">Estimate the best quote before publishing your gig.</p>
      </div>
      <span class="pill">{{ currencyLabel }}</span>
    </div>

    <div v-if="safePrice > 0" class="calculator-grid">
      <div class="metric">
        <span class="label">Base price</span>
        <strong>{{ currencyLabel }} {{ formatMoney(safePrice) }}</strong>
      </div>
      <div class="metric">
        <span class="label">Suggested quote</span>
        <strong>{{ currencyLabel }} {{ formatMoney(suggestedQuote) }}</strong>
      </div>
      <div class="metric">
        <span class="label">Platform fee</span>
        <strong>{{ currencyLabel }} {{ formatMoney(serviceFee) }}</strong>
      </div>
      <div class="metric highlight">
        <span class="label">Net earnings</span>
        <strong>{{ currencyLabel }} {{ formatMoney(netEarnings) }}</strong>
      </div>
    </div>

    <div v-else class="empty-state">
      Enter a base price to see the quote estimate.
    </div>
  </section>
</template>

<style scoped>
.calculator-card {
  padding: 1.25rem;
  display: grid;
  gap: 1rem;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.card-head h3 {
  margin: 0;
  font-size: 1.05rem;
  color: #0f172a;
}

.card-head p {
  margin: 0.25rem 0 0;
}

.pill {
  border: 1px solid #bfdbfe;
  background: #eff6ff;
  color: #1d4ed8;
  border-radius: 999px;
  padding: 0.3rem 0.7rem;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.calculator-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.metric {
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 0.85rem;
  background: #fff;
  display: grid;
  gap: 0.2rem;
}

.metric.highlight {
  background: #eff6ff;
  border-color: #bfdbfe;
}

.label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.metric strong {
  color: #0f172a;
  font-size: 1rem;
}

.empty-state {
  border: 1px dashed var(--color-border);
  border-radius: 12px;
  padding: 0.9rem 1rem;
  color: #64748b;
  font-size: 0.875rem;
  background: #f8fafc;
}

@media (max-width: 640px) {
  .calculator-grid {
    grid-template-columns: 1fr;
  }
}
</style>
