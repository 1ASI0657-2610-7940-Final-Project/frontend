<script setup lang="ts">
import { computed, ref } from 'vue'

type ServiceLevel = 'AMATEUR' | 'PROFESSIONAL'

const props = defineProps<{
  basePrice?: number | null
  currency?: string
  categoryName?: string
}>()

const emit = defineEmits<{ 'apply-price': [price: number] }>()

const serviceLevel = ref<ServiceLevel>('PROFESSIONAL')
const revisionCount = ref(2)

const normalizedCurrency = computed(() => (props.currency || 'PEN').trim().toUpperCase())

const normalizedBasePrice = computed(() => {
  const value = Number(props.basePrice)
  return Number.isFinite(value) && value > 0 ? value : 0
})

const categoryFactor = computed(() => {
  const category = (props.categoryName || '').toLowerCase()
  if (!category) return 1
  if (category.includes('design') || category.includes('creative')) return 1.1
  if (category.includes('development') || category.includes('software') || category.includes('tech')) return 1.18
  if (category.includes('marketing') || category.includes('sales')) return 1.06
  if (category.includes('video') || category.includes('motion')) return 1.12
  if (category.includes('writing') || category.includes('copy')) return 0.98
  return 1.02
})

const levelFactor = computed(() => (serviceLevel.value === 'AMATEUR' ? 0.9 : 1.12))

const revisionFactor = computed(() => 1 + Math.min(Math.max(revisionCount.value, 0), 10) * 0.035)

const suggestionAnchor = computed(() => normalizedBasePrice.value * categoryFactor.value * levelFactor.value * revisionFactor.value)
const competitivePrice = computed(() => roundMoney(suggestionAnchor.value * 0.88))
const recommendedPrice = computed(() => roundMoney(suggestionAnchor.value * 1.05))
const currentQuote = computed(() => roundMoney(normalizedBasePrice.value || suggestionAnchor.value))
const selectedPrice = computed(() => normalizedBasePrice.value)
const platformFee = computed(() => roundMoney(selectedPrice.value * 0.12))
const netEarning = computed(() => roundMoney(selectedPrice.value - platformFee.value))

const formatMoney = (value: number) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)

const roundMoney = (value: number) => Math.max(0, Math.round(value * 100) / 100)

const applyPrice = (price: number) => {
  if (!Number.isFinite(price) || price <= 0) return
  emit('apply-price', roundMoney(price))
}
</script>

<template>
  <section class="card calculator-card">
    <div class="calculator-head">
      <div>
        <h3>Price Calculator</h3>
        <p class="muted">Use the category, skill level, and revision count to estimate the best price.</p>
      </div>
      <span class="pill">{{ normalizedCurrency }}</span>
    </div>

    <div class="calculator-controls">
      <label class="control">
        <span>Service level</span>
        <select v-model="serviceLevel">
          <option value="AMATEUR">Amateur</option>
          <option value="PROFESSIONAL">Professional</option>
        </select>
      </label>
      <label class="control">
        <span>Revisions</span>
        <input v-model.number="revisionCount" type="number" min="0" max="10" step="1" />
      </label>
      <div class="control readonly">
        <span>Category</span>
        <strong>{{ categoryName || 'Select a category above' }}</strong>
      </div>
    </div>

    <div class="suggestion-grid">
      <article class="suggestion-card competitive">
        <span class="suggestion-label">Competitive price</span>
        <strong>{{ normalizedCurrency }} {{ formatMoney(competitivePrice) }}</strong>
        <p>More aggressive pricing to win volume.</p>
        <button type="button" class="suggestion-btn" @click="applyPrice(competitivePrice)">Use competitive</button>
      </article>

      <article class="suggestion-card recommended">
        <span class="suggestion-label">Recommended price</span>
        <strong>{{ normalizedCurrency }} {{ formatMoney(recommendedPrice) }}</strong>
        <p>Balanced pricing for better margin and conversion.</p>
        <button type="button" class="suggestion-btn" @click="applyPrice(recommendedPrice)">Use recommended</button>
      </article>
    </div>

    <div class="metrics-grid">
      <div class="metric">
        <span>Base Price</span>
        <strong>{{ normalizedCurrency }} {{ formatMoney(normalizedBasePrice) }}</strong>
      </div>
      <div class="metric">
        <span>Suggested Quote</span>
        <strong>{{ normalizedCurrency }} {{ formatMoney(currentQuote) }}</strong>
      </div>
      <div class="metric">
        <span>Platform Fee</span>
        <strong>{{ normalizedCurrency }} {{ formatMoney(platformFee) }}</strong>
      </div>
      <div class="metric highlight">
        <span>Net Earning</span>
        <strong>{{ normalizedCurrency }} {{ formatMoney(netEarning) }}</strong>
      </div>
    </div>

    <p class="hint">If you want a custom price, edit the base price field in the gig form. The calculator updates automatically.</p>
  </section>
</template>

<style scoped>
.calculator-card {
  padding: 1.25rem;
  display: grid;
  gap: 1rem;
}

.calculator-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.calculator-head h3 {
  margin: 0;
  font-size: 1.05rem;
  color: #0f172a;
}

.calculator-head p {
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

.calculator-controls {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.85rem;
}

.control {
  display: grid;
  gap: 0.3rem;
}

.control span {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.control select,
.control input {
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 0.72rem 0.85rem;
  font: inherit;
  color: #0f172a;
  background: #fff;
}

.control.readonly strong {
  border: 1px dashed var(--color-border);
  border-radius: 10px;
  padding: 0.72rem 0.85rem;
  color: #0f172a;
  font-size: 0.92rem;
  min-height: 2.55rem;
  display: flex;
  align-items: center;
}

.suggestion-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.suggestion-card {
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 1rem;
  background: #fff;
  display: grid;
  gap: 0.45rem;
}

.suggestion-card.competitive {
  background: #f8fafc;
}

.suggestion-card.recommended {
  background: #eff6ff;
  border-color: #bfdbfe;
}

.suggestion-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.suggestion-card strong {
  color: #0f172a;
  font-size: 1.1rem;
}

.suggestion-card p {
  margin: 0;
  color: #475569;
  font-size: 0.86rem;
}

.suggestion-btn {
  border: 1px solid var(--color-primary);
  background: #fff;
  color: var(--color-primary);
  border-radius: 10px;
  padding: 0.6rem 0.85rem;
  font-weight: 700;
  cursor: pointer;
}

.suggestion-btn:hover {
  background: #eff6ff;
}

.metrics-grid {
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

.metric span {
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

.hint {
  margin: 0;
  font-size: 0.85rem;
  color: #64748b;
}

@media (max-width: 820px) {
  .calculator-controls,
  .suggestion-grid,
  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .calculator-head {
    flex-direction: column;
  }
}
</style>
