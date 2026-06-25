<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMarketplaceStore } from '@marketplace/stores/marketplaceStore'
import { normalizeError } from '../../../shared/utils/errorMapper'
import Toast from '../../../shared/components/Toast.vue'
import PriceCalculatorPanel from '../components/PriceCalculatorPanel.vue'

const router = useRouter()
const store = useMarketplaceStore()

const busy = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

// Form data fields matching CreateServicePayload
const title = ref('')
const categoryId = ref('')
const basePrice = ref<number | undefined>(undefined)
const currency = ref('USD')
const deliveryDays = ref(3)
const description = ref('')
const tagInputValue = ref('')
const tagsList = ref<string[]>([])

// Portfolio media list for user-selected files
interface PortfolioItem {
  id: string
  url: string
  file?: File
  primary: boolean
}

const portfolioItems = ref<PortfolioItem[]>([])

const fileInputRef = ref<HTMLInputElement | null>(null)

// Tags management
const addTag = () => {
  const cleanVal = tagInputValue.value.trim().replace(/,/g, '')
  if (cleanVal && !tagsList.value.includes(cleanVal)) {
    tagsList.value.push(cleanVal)
  }
  tagInputValue.value = ''
}

const removeTag = (tag: string) => {
  tagsList.value = tagsList.value.filter((t) => t !== tag)
}

// Portfolio images management
const triggerFileInput = () => {
  if (fileInputRef.value) fileInputRef.value.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    addFiles(Array.from(target.files))
  }
}

const handleFileDrop = (event: DragEvent) => {
  if (event.dataTransfer?.files) {
    addFiles(Array.from(event.dataTransfer.files))
  }
}

const addFiles = (files: File[]) => {
  const remainingSlots = 3 - portfolioItems.value.length
  if (remainingSlots <= 0) {
    showToast('You can upload a maximum of 3 images.', 'error')
    return
  }

  const filesToAdd = files.slice(0, remainingSlots)
  for (const file of filesToAdd) {
    const url = URL.createObjectURL(file)
    portfolioItems.value.push({
      id: Math.random().toString(36).substr(2, 9),
      url,
      file,
      primary: portfolioItems.value.length === 0
    })
  }
}

const removeImage = (id: string) => {
  const item = portfolioItems.value.find((i) => i.id === id)
  if (item && item.url.startsWith('blob:')) {
    URL.revokeObjectURL(item.url)
  }
  
  const wasPrimary = item?.primary
  portfolioItems.value = portfolioItems.value.filter((i) => i.id !== id)
  
  // Re-assign primary cover if the deleted one was primary
  if (wasPrimary && portfolioItems.value.length > 0) {
    portfolioItems.value[0].primary = true
  }
}

const setAsPrimary = (id: string) => {
  portfolioItems.value.forEach((i) => {
    i.primary = i.id === id
  })
}

const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
  message.value = msg
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 4000)
}

const goBack = () => {
  router.push('/freelancer/gigs')
}

// Publish Gig execution flow
const publishGig = async (statusOverride = 'PUBLISHED') => {
  if (!title.value.trim()) { showToast('Please enter a gig title.', 'error'); return }
  if (!categoryId.value) { showToast('Please select a category.', 'error'); return }
  if (!basePrice.value || basePrice.value <= 0) { showToast('Please enter a valid price.', 'error'); return }
  if (!description.value.trim()) { showToast('Please enter a description.', 'error'); return }

  busy.value = true
  message.value = ''
  
  try {
    // 1. Create service in the backend
    const payload = {
      title: 'I will ' + title.value.trim(),
      description: description.value.trim(),
      basePrice: Number(basePrice.value),
      currency: currency.value,
      categoryId: categoryId.value,
      deliveryDays: Number(deliveryDays.value),
      tags: tagsList.value
    }
    
    const created = await store.createService(payload)
    const serviceId = created.id
    
    // 2. Upload images one by one
    for (const item of portfolioItems.value) {
      let fileToUpload: File | undefined = item.file

      if (fileToUpload) {
        const formData = new FormData()
        formData.append('file', fileToUpload)
        // Note: The API defaults primary logic, or we upload it directly
        await store.uploadServiceMedia(serviceId, formData)
      }
    }

    // 3. Update status if draft
    if (statusOverride === 'DRAFT') {
      await store.updateService(serviceId, { status: 'DRAFT' })
      showToast('Gig saved as draft successfully!', 'success')
    } else {
      showToast('Gig published successfully!', 'success')
    }

    setTimeout(() => {
      router.push('/freelancer/gigs')
    }, 1500)
    
  } catch (err) {
    showToast(normalizeError(err).message, 'error')
  } finally {
    busy.value = false
  }
}

onMounted(async () => {
  await store.fetchCategories()
})
</script>

<template>
  <div class="create-page-container">
    <Toast v-if="message" :message="message" :type="messageType" />

    <!-- TOP HEADER BAR -->
    <header class="header-bar">
      <div class="header-left">
        <button class="close-btn" @click="goBack" aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <span class="vertical-line"></span>
        <span class="header-title">Create a New Gig</span>
      </div>
      <div class="header-right">
        <button class="text-btn draft-btn" :disabled="busy" @click="publishGig('DRAFT')">Save as Draft</button>
        <span class="vertical-line"></span>
        <span class="step-label">Step 1 of 1</span>
      </div>
    </header>

    <!-- CONTENT WRAPPER -->
    <main class="content-wrapper">
      <div class="setup-heading">
        <h1 class="main-title">Let’s set up your Gig</h1>
        <p class="main-sub">Define your service, set your terms, and showcase your expertise to potential clients.</p>
      </div>

      <!-- FORM CARDS -->
      <div class="cards-list">
        
        <!-- CARD 1: BASIC OVERVIEW -->
        <section class="form-card card">
          <div class="card-header">
            <svg class="header-icon blue" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <h2 class="card-title">Basic Overview</h2>
          </div>
          <div class="card-body">
            <!-- Gig Title -->
            <div class="form-group">
              <label class="field-label">Gig Title</label>
              <p class="field-sub">Create a catchy title that describes exactly what you will deliver.</p>
              <div class="title-input-wrapper">
                <span class="prefix">I will</span>
                <input 
                  v-model="title" 
                  type="text" 
                  placeholder="design a modern corporate logo for your startup..."
                  class="title-input" 
                  required
                />
              </div>
            </div>

            <!-- Row: Category & Search Tags -->
            <div class="grid-two">
              <div class="form-group">
                <label class="field-label">Category</label>
                <div class="select-wrapper">
                  <select v-model="categoryId" class="custom-select" required>
                    <option value="" disabled>Select a category</option>
                    <option v-for="cat in store.categories" :key="cat.id" :value="cat.id">
                      {{ cat.name }}
                    </option>
                  </select>
                  <svg class="select-chevron" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>

              <div class="form-group">
                <label class="field-label">Search Tags</label>
                <input 
                  v-model="tagInputValue" 
                  type="text" 
                  placeholder="Press enter to add tags (e.g., logo, branding)" 
                  class="input-field" 
                  @keydown.enter.prevent="addTag"
                />
                <!-- Tags pill list -->
                <div class="tags-list-container" v-if="tagsList.length">
                  <span v-for="tag in tagsList" :key="tag" class="tag-pill">
                    {{ tag }}
                    <button class="remove-tag-btn" @click="removeTag(tag)" aria-label="Remove tag">&times;</button>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- CARD 2: SCOPE & PRICING -->
        <section class="form-card card">
          <div class="card-header">
            <svg class="header-icon blue" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
            <h2 class="card-title">Scope & Pricing</h2>
          </div>
          <div class="card-body">
            <div class="grid-two">
              <!-- Base Price -->
              <div class="form-group">
                <label class="field-label">Base Price</label>
                <p class="field-sub">Set the starting price for this service.</p>
                <div class="price-input-wrapper">
                  <span class="currency-label">{{ currency }} $</span>
                  <input 
                    v-model="basePrice" 
                    type="number" 
                    min="1" 
                    step="0.01" 
                    placeholder="0.00" 
                    class="price-input" 
                    required
                  />
                </div>
              </div>

              <!-- Delivery Time -->
              <div class="form-group">
                <label class="field-label">Delivery Time</label>
                <p class="field-sub">Estimated time to complete the work.</p>
                <div class="select-wrapper">
                  <select v-model="deliveryDays" class="custom-select" required>
                    <option :value="1">1 Day</option>
                    <option :value="2">2 Days</option>
                    <option :value="3">3 Days</option>
                    <option :value="5">5 Days</option>
                    <option :value="7">7 Days</option>
                    <option :value="10">10 Days</option>
                    <option :value="14">14 Days</option>
                    <option :value="21">21 Days</option>
                    <option :value="30">30 Days</option>
                  </select>
                  <svg class="select-chevron" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        <PriceCalculatorPanel :base-price="basePrice" :delivery-days="deliveryDays" :currency="currency" />

        <!-- CARD 3: DETAILED DESCRIPTION -->
        <section class="form-card card">
          <div class="card-header">
            <svg class="header-icon blue" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <h2 class="card-title">Detailed Description</h2>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label class="field-label">About this Gig</label>
              <p class="field-sub">Provide a comprehensive description of what you offer, your process, and what the buyer will receive.</p>
              
              <!-- Editor Container -->
              <div class="editor-container">
                <div class="editor-toolbar">
                  <button type="button" class="toolbar-btn" title="Bold"><strong>B</strong></button>
                  <button type="button" class="toolbar-btn" title="Italic"><em>I</em></button>
                  <button type="button" class="toolbar-btn" title="Bullet List">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                  </button>
                  <span class="toolbar-divider"></span>
                  <button type="button" class="toolbar-btn" title="Add Link">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                  </button>
                </div>
                <textarea 
                  v-model="description" 
                  rows="8" 
                  placeholder="Describe your process, tools used, and the final deliverables..."
                  class="editor-textarea"
                  required
                ></textarea>
              </div>
            </div>
          </div>
        </section>

        <!-- CARD 4: PROJECT PORTFOLIO -->
        <section class="form-card card">
          <div class="card-header">
            <svg class="header-icon blue" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            <h2 class="card-title">Project Portfolio</h2>
          </div>
          <div class="card-body">
            <div class="portfolio-meta-row">
              <span class="field-label">Upload high-quality images to showcase your work.</span>
              <span class="max-note">Max 3 images</span>
            </div>

            <!-- Upload Zone -->
            <div 
              class="upload-dropzone" 
              @click="triggerFileInput"
              @dragover.prevent
              @drop.prevent="handleFileDrop"
              :class="{ disabled: portfolioItems.length >= 3 }"
            >
              <input 
                ref="fileInputRef" 
                type="file" 
                multiple 
                accept="image/png, image/jpeg" 
                class="hidden-file-input" 
                @change="handleFileSelect"
              />
              <div class="cloud-icon-wrap">
                <svg class="cloud-icon" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.2 15a4.8 4.8 0 0 0-9.6-.8 5.6 5.6 0 0 0-10.8 2.4 5.6 5.6 0 0 0 10.8 1V13M12 13v8M9 16l3-3 3 3"/></svg>
              </div>
              <p class="drop-title">Drag and drop images here</p>
              <p class="drop-sub">or <span class="browse-link">browse files</span> (JPG, PNG up to 5MB)</p>
            </div>

            <!-- Thumbnails grid -->
            <div class="thumbnails-grid">
              <div 
                v-for="item in portfolioItems" 
                :key="item.id" 
                class="thumb-box"
              >
                <img :src="item.url" class="thumb-img" alt="Portfolio asset" />
                <span class="cover-badge" v-if="item.primary">Primary Cover</span>
                <div class="thumb-overlay">
                  <button type="button" class="action-overlay-btn" v-if="!item.primary" @click="setAsPrimary(item.id)">Set Primary</button>
                  <button type="button" class="action-overlay-btn delete" @click="removeImage(item.id)">Delete</button>
                </div>
              </div>

              <!-- Empty slots / Add image box -->
              <div 
                v-for="i in (3 - portfolioItems.length)" 
                :key="'empty-' + i" 
                class="thumb-box empty-slot"
                @click="triggerFileInput"
              >
                <div class="empty-content">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <span class="add-txt">Add Image</span>
                </div>
              </div>
            </div>

          </div>
        </section>

      </div>
    </main>

    <!-- FIXED FOOTER BAR -->
    <footer class="footer-bar">
      <RouterLink to="/marketplace" class="preview-link">Preview Gig</RouterLink>
      <div class="footer-actions">
        <button class="secondary-btn" :disabled="busy" @click="publishGig('DRAFT')">Save as Draft</button>
        <button class="primary-btn" :disabled="busy" @click="publishGig('PUBLISHED')">
          {{ busy ? 'Publishing...' : 'Publish Gig' }}
          <svg class="rocket-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 3.5-2 3.5s2.24-.5 3.5-2"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L12 8.606l3.394 3.394-8.562 8.562C8.34 21.475 10.11 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
        </button>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Main layout styles matching Fiverr style and provided layout images */
.create-page-container {
  min-height: 100vh;
  background: #f4f6fb;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #0f172a;
  display: flex;
  flex-direction: column;
  padding-top: 60px; /* Space for fixed header */
  padding-bottom: 80px; /* Space for fixed footer */
  box-sizing: border-box;
}

/* TOP HEADER BAR */
.header-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1.5rem;
  z-index: 100;
}
.header-left, .header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}
.close-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}
.vertical-line {
  width: 1px;
  height: 24px;
  background: #cbd5e1;
}
.header-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: #0f172a;
}
.text-btn {
  background: none;
  border: none;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: color 0.15s ease;
}
.draft-btn {
  color: #475569;
}
.draft-btn:hover:not(:disabled) {
  color: #0f172a;
}
.step-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
}

/* CONTENT CONTAINER */
.content-wrapper {
  max-width: 820px;
  width: 90%;
  margin: 0 auto;
  padding: 2rem 0;
}

.setup-heading {
  margin-bottom: 2rem;
}
.main-title {
  font-size: 2.25rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.02em;
}
.main-sub {
  font-size: 1.05rem;
  color: #475569;
  margin: 0.5rem 0 0;
}

.cards-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* CARD LAYOUTS */
.form-card {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
  padding: 1.75rem;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #cbd5e1;
  margin-bottom: 1.5rem;
}
.header-icon {
  flex-shrink: 0;
}
.header-icon.blue {
  color: #2563eb;
}
.card-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* FIELDS & INPUTS */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.field-label {
  font-size: 0.925rem;
  font-weight: 700;
  color: #0f172a;
}
.field-sub {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0 0 0.25rem 0;
}

.grid-two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}
@media (max-width: 640px) {
  .grid-two {
    grid-template-columns: 1fr;
  }
}

/* TITLE PREFIXED INPUT */
.title-input-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  padding: 0 0.85rem;
  transition: all 0.2s ease;
}
.title-input-wrapper:focus-within {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}
.title-input-wrapper .prefix {
  font-weight: 700;
  color: #0f172a;
  font-size: 0.95rem;
  margin-right: 0.6rem;
  user-select: none;
}
.title-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 0.75rem 0;
  font-size: 0.95rem;
  color: #0f172a;
  font-family: inherit;
  width: 100%;
}

/* NORMAL INPUTS & SELECTS */
.input-field {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  outline: none;
  padding: 0.75rem 0.85rem;
  font-size: 0.925rem;
  font-family: inherit;
  color: #0f172a;
  transition: all 0.2s ease;
}
.input-field:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.select-wrapper {
  position: relative;
  display: flex;
}
.custom-select {
  width: 100%;
  appearance: none;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  outline: none;
  padding: 0.75rem 2.5rem 0.75rem 0.85rem;
  font-size: 0.925rem;
  font-family: inherit;
  color: #0f172a;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
}
.custom-select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}
.select-chevron {
  position: absolute;
  right: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #64748b;
}

/* PRICE INPUT PREFIXED */
.price-input-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  padding: 0 0.85rem;
  transition: all 0.2s ease;
}
.price-input-wrapper:focus-within {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}
.currency-label {
  font-weight: 700;
  color: #64748b;
  font-size: 0.925rem;
  margin-right: 0.6rem;
  user-select: none;
}
.price-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 0.75rem 0;
  font-size: 0.95rem;
  color: #0f172a;
  font-family: inherit;
  width: 100%;
}

/* TAGS PILLS */
.tags-list-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.65rem;
}
.tag-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
  color: #334155;
  font-weight: 600;
}
.remove-tag-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 1.05rem;
  line-height: 1;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s ease;
}
.remove-tag-btn:hover {
  color: #ef4444;
}

/* RICH TEXT STYLE TEXTAREA EDITOR */
.editor-container {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  overflow: hidden;
  background: #ffffff;
  transition: all 0.2s ease;
}
.editor-container:focus-within {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}
.editor-toolbar {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border-bottom: 1px solid #cbd5e1;
  padding: 0.5rem;
  gap: 0.25rem;
}
.toolbar-btn {
  background: none;
  border: none;
  border-radius: 4px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s ease;
}
.toolbar-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}
.toolbar-divider {
  width: 1px;
  height: 16px;
  background: #cbd5e1;
  margin: 0 0.25rem;
}
.editor-textarea {
  width: 100%;
  border: none;
  outline: none;
  padding: 0.85rem;
  font-size: 0.925rem;
  line-height: 1.5;
  color: #0f172a;
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;
}

/* PROJECT PORTFOLIO SECTION */
.portfolio-meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}
.max-note {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 600;
}

.upload-dropzone {
  border: 1px dashed #2563eb;
  background: #f0f4ff;
  border-radius: 12px;
  padding: 2.25rem 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.upload-dropzone:hover:not(.disabled) {
  background: #e0ebff;
  border-color: #1d4ed8;
}
.upload-dropzone.disabled {
  border-color: #cbd5e1;
  background: #f8fafc;
  cursor: not-allowed;
  opacity: 0.75;
}
.hidden-file-input {
  display: none;
}
.cloud-icon-wrap {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 0.75rem;
}
.drop-title {
  font-weight: 700;
  font-size: 0.95rem;
  margin: 0 0 0.25rem 0;
  color: #0f172a;
}
.drop-sub {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0;
}
.browse-link {
  color: #2563eb;
  font-weight: 700;
  text-decoration: underline;
}

.thumbnails-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  margin-top: 1.5rem;
}
@media (max-width: 640px) {
  .thumbnails-grid {
    grid-template-columns: 1fr;
  }
}
.thumb-box {
  position: relative;
  aspect-ratio: 1.6 / 1;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  box-sizing: border-box;
}
.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.cover-badge {
  position: absolute;
  top: 0.65rem;
  left: 0.65rem;
  background: #475569;
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.thumb-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.75);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}
.thumb-box:hover .thumb-overlay {
  opacity: 1;
}

.action-overlay-btn {
  background: #ffffff;
  color: #0f172a;
  border: none;
  border-radius: 6px;
  padding: 0.35rem 0.75rem;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  width: 100px;
}
.action-overlay-btn:hover {
  background: #f1f5f9;
}
.action-overlay-btn.delete {
  background: #dc2626;
  color: #ffffff;
}
.action-overlay-btn.delete:hover {
  background: #b91c1c;
}

/* Empty slots */
.empty-slot {
  border: 1px dashed #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}
.empty-slot:hover {
  border-color: #2563eb;
  background: #f0f4ff;
}
.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #64748b;
  gap: 0.35rem;
  transition: color 0.15s ease;
}
.empty-slot:hover .empty-content {
  color: #2563eb;
}
.add-txt {
  font-size: 0.78rem;
  font-weight: 700;
}

/* FIXED FOOTER BAR */
.footer-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: #ffffff;
  border-top: 1px solid #cbd5e1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  z-index: 100;
}
.preview-link {
  font-weight: 700;
  color: #2563eb;
  font-size: 0.9rem;
  text-decoration: none;
  transition: color 0.15s ease;
}
.preview-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}
.footer-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.secondary-btn {
  background: #ffffff;
  border: 1px solid #2563eb;
  color: #2563eb;
  border-radius: 8px;
  padding: 0.65rem 1.25rem;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}
.secondary-btn:hover:not(:disabled) {
  background: #f0f4ff;
}
.primary-btn {
  background: #2563eb;
  border: none;
  color: #ffffff;
  border-radius: 8px;
  padding: 0.68rem 1.4rem;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}
.primary-btn:hover:not(:disabled) {
  background: #1d4ed8;
}
.primary-btn:disabled, .secondary-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.rocket-icon {
  transform: rotate(45deg);
}
</style>
