<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import LoadingState from '../../../shared/components/LoadingState.vue'
import ErrorState from '../../../shared/components/ErrorState.vue'
import { useMarketplaceStore } from '@marketplace/stores/marketplaceStore'

interface GigItem {
  id: string
  title: string
  description: string
  status: string
  price: number | null
  priceUnit: string | null
  views?: string
  saves?: string
  lastEdited?: string
  image: string | null
  isReal?: boolean
}

const router = useRouter()
const store = useMarketplaceStore()

const searchQuery = ref('')
const currentTab = ref<'ALL' | 'ACTIVE' | 'DRAFT'>('ALL')
const PAGE_SIZE = 3
const currentPage = ref(1)

// Mock Gigs representing the list in the screenshot to fill the screen if no backend data exists
const mockGigs = ref<GigItem[]>([
  {
    id: 'mock-1',
    title: 'Full-Stack Web Application Development',
    description: 'Custom React & Node.js solutions for enterprise clients.',
    views: '1.2k views',
    saves: '45 saves',
    status: 'Active',
    price: 500,
    priceUnit: 'per project',
    image: '/mock-portfolio/laptop.png'
  },
  {
    id: 'mock-2',
    title: 'UI/UX Design for SaaS Platforms',
    description: 'High-fidelity wireframes and interactive prototypes.',
    views: '850 views',
    saves: '22 saves',
    status: 'Active',
    price: 80,
    priceUnit: 'hourly rate',
    image: '/mock-portfolio/laptop.png'
  },
  {
    id: 'mock-3',
    title: 'Technical Writing & API Documentation',
    description: 'Clear, concise developer docs (swagger, Postman).',
    lastEdited: 'Last edited 2 days ago',
    status: 'Draft',
    price: null,
    priceUnit: null,
    image: null
  },
  {
    id: 'mock-4',
    title: 'Custom WordPress Theme Development',
    description: 'Responsive and fast loading corporate themes.',
    views: '410 views',
    saves: '12 saves',
    status: 'Active',
    price: 350,
    priceUnit: 'per project',
    image: '/mock-portfolio/laptop.png'
  },
  {
    id: 'mock-5',
    title: 'API Integration & Database Migration',
    description: 'Seamless connection with PostgreSQL and third-party APIs.',
    views: '320 views',
    saves: '8 saves',
    status: 'Active',
    price: 600,
    priceUnit: 'per project',
    image: '/mock-portfolio/chart.png'
  },
  {
    id: 'mock-6',
    title: 'SaaS Landing Page Design',
    description: 'High-converting modern UI layouts using Figma.',
    views: '980 views',
    saves: '34 saves',
    status: 'Active',
    price: 250,
    priceUnit: 'per project',
    image: '/mock-portfolio/laptop.png'
  },
  {
    id: 'mock-7',
    title: 'Python Data Scraping Scripts',
    description: 'Automated data extraction and CSV formatting tools.',
    lastEdited: 'Last edited 1 day ago',
    status: 'Draft',
    price: null,
    priceUnit: null,
    image: null
  },
  {
    id: 'mock-8',
    title: 'Social Media Marketing Kit',
    description: 'Branding elements, banner designs and post templates.',
    views: '540 views',
    saves: '19 saves',
    status: 'Active',
    price: 150,
    priceUnit: 'per project',
    image: '/mock-portfolio/chart.png'
  },
  {
    id: 'mock-9',
    title: 'E-commerce Shopify Store Setup',
    description: 'Theme customization, payment configuration, and product uploads.',
    views: '670 views',
    saves: '25 saves',
    status: 'Active',
    price: 800,
    priceUnit: 'per project',
    image: '/mock-portfolio/laptop.png'
  },
  {
    id: 'mock-10',
    title: 'Mobile App UI Wireframing',
    description: 'Figma blueprints and user flows for iOS/Android.',
    lastEdited: 'Last edited 5 days ago',
    status: 'Draft',
    price: null,
    priceUnit: null,
    image: null
  },
  {
    id: 'mock-11',
    title: 'Node.js Backend REST API Development',
    description: 'Secure Express.js endpoints with JWT auth.',
    views: '880 views',
    saves: '39 saves',
    status: 'Active',
    price: 75,
    priceUnit: 'hourly rate',
    image: '/mock-portfolio/laptop.png'
  },
  {
    id: 'mock-12',
    title: 'Search Engine Optimization Audit',
    description: 'Detailed page speed and indexation reports.',
    lastEdited: 'Last edited 1 week ago',
    status: 'Draft',
    price: null,
    priceUnit: null,
    image: null
  }
])

const allGigs = computed<GigItem[]>(() => {
  if (store.myServices && store.myServices.length > 0) {
    return store.myServices.map((g) => ({
      id: g.id,
      title: g.title,
      description: 'Manage and update your active service offering.',
      status: g.status === 'PUBLISHED' ? 'Active' : 'Draft',
      price: g.basePrice,
      priceUnit: 'per project',
      views: '0 views',
      saves: '0 saves',
      image: g.thumbnailUrl || null,
      isReal: true
    }))
  }
  return mockGigs.value
})

const activeCount = computed(() => allGigs.value.filter((g) => g.status === 'Active').length)
const draftCount = computed(() => allGigs.value.filter((g) => g.status === 'Draft').length)
const totalCount = computed(() => allGigs.value.length)

const filteredGigs = computed(() => {
  let list = allGigs.value

  // Tab filter
  if (currentTab.value === 'ACTIVE') {
    list = list.filter((g) => g.status === 'Active')
  } else if (currentTab.value === 'DRAFT') {
    list = list.filter((g) => g.status === 'Draft')
  }

  // Search filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter((g) => g.title.toLowerCase().includes(q) || g.description.toLowerCase().includes(q))
  }

  return list
})

const totalPages = computed(() => Math.ceil(filteredGigs.value.length / PAGE_SIZE))
const pagedGigs = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredGigs.value.slice(start, start + PAGE_SIZE)
})

const removeGig = async (id: string) => {
  const confirmed = window.confirm('Delete this gig?')
  if (!confirmed) return
  
  if (id.startsWith('mock-')) {
    mockGigs.value = mockGigs.value.filter((g) => g.id !== id)
    return
  }

  try {
    await store.deleteService(id)
    await store.fetchMyServices()
  } catch (err) {
    console.error('Failed to delete gig:', err)
  }
}

const editGig = (id: string) => {
  if (id.startsWith('mock-')) {
    alert('Mock gigs cannot be edited. Try creating a new gig first!')
    return
  }
  router.push(`/freelancer/gigs/${id}/edit`)
}

onMounted(async () => {
  try {
    await store.fetchMyServices()
  } catch (e) {
    console.warn('Failed to fetch services, using mockup entries.', e)
  }
})
</script>

<template>
  <section class="my-gigs">
    <!-- Header -->
    <header class="head">
      <div>
        <h1 class="page-title">My Gigs</h1>
        <p class="page-subtitle">Manage your service offerings, update pricing, and track status.</p>
      </div>
      <button class="create-btn" @click="router.push('/freelancer/gigs/new')">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="12" y2="12"/></svg>
        Create New Gig
      </button>
    </header>

    <ErrorState v-if="store.error" :message="store.error" />

    <template v-else>
      <!-- Search and Filter Bar -->
      <div class="search-filter-bar">
        <!-- Search input -->
        <div class="search-input-wrapper">
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search your gigs by title or keywords..." 
            class="search-input"
            @input="currentPage = 1"
          />
        </div>

        <!-- Tabs filter container -->
        <div class="tabs-container">
          <button 
            class="tab-btn" 
            :class="{ active: currentTab === 'ALL' }" 
            @click="currentTab = 'ALL'; currentPage = 1"
          >
            All ({{ totalCount }})
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: currentTab === 'ACTIVE' }" 
            @click="currentTab = 'ACTIVE'; currentPage = 1"
          >
            Active ({{ activeCount }})
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: currentTab === 'DRAFT' }" 
            @click="currentTab = 'DRAFT'; currentPage = 1"
          >
            Draft ({{ draftCount }})
          </button>
          
          <span class="tab-divider"></span>
          
          <button class="settings-filter-btn" title="Filters">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          </button>
        </div>
      </div>

      <!-- Table Content -->
      <div v-if="store.loading" class="loading-wrap">
        <LoadingState />
      </div>

      <div v-else class="card table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Gig Details</th>
              <th>Status</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="gig in pagedGigs" :key="gig.id">
              <!-- Gig Details Column -->
              <td class="gig-cell">
                <div class="gig-media-container" v-if="gig.image">
                  <img :src="gig.image" class="gig-thumbnail" alt="Gig Cover" />
                </div>
                <div class="gig-media-container placeholder" v-else>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                </div>
                
                <div class="gig-info">
                  <div class="gig-title">{{ gig.title }}</div>
                  <div class="gig-desc muted">{{ gig.description }}</div>
                  <!-- Stats or Last Edited info -->
                  <div class="gig-meta" v-if="gig.status === 'Active'">
                    <span class="meta-item">
                      <svg class="meta-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      {{ gig.views }}
                    </span>
                    <span class="meta-item">
                      <svg class="meta-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                      {{ gig.saves }}
                    </span>
                  </div>
                  <div class="gig-meta" v-else-if="gig.lastEdited">
                    <span class="meta-item text-only">{{ gig.lastEdited }}</span>
                  </div>
                </div>
              </td>

              <!-- Status Badge Column -->
              <td class="status-cell">
                <span class="status-badge" :class="gig.status.toLowerCase()">
                  <span class="status-dot"></span>
                  {{ gig.status }}
                </span>
              </td>

              <!-- Price Column -->
              <td class="price-cell">
                <template v-if="gig.price !== null && gig.price !== undefined">
                  <div class="price-lbl">From</div>
                  <div class="price-val">${{ gig.price }}</div>
                  <div class="price-sub">{{ gig.priceUnit }}</div>
                </template>
                <template v-else>
                  <div class="price-val dash">—</div>
                  <div class="price-sub">Not set</div>
                </template>
              </td>

              <!-- Actions Column -->
              <td class="actions-cell">
                <div class="actions-row">
                  <button class="action-btn" title="Edit Gig" @click="editGig(gig.id)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button class="action-btn delete" title="Delete Gig" @click="removeGig(gig.id)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Table Pagination Footer -->
        <div class="table-footer">
          <span class="pagination-info muted">
            Showing {{ (currentPage - 1) * PAGE_SIZE + 1 }} to {{ Math.min(currentPage * PAGE_SIZE, filteredGigs.length) }} of {{ filteredGigs.length }} entries
          </span>
          <div class="pagination-btns">
            <button class="page-btn" :disabled="currentPage <= 1" @click="currentPage--">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button class="page-btn" :disabled="currentPage >= totalPages" @click="currentPage++">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
.my-gigs { display: flex; flex-direction: column; gap: 1.5rem; font-family: 'Inter', sans-serif; }

/* Header section */
.head { display: flex; justify-content: space-between; align-items: flex-start; }
.page-title { margin: 0; font-size: 2rem; font-weight: 800; color: #0f172a; }
.page-subtitle { margin: 0.35rem 0 0; font-size: 1rem; color: #475569; }
.create-btn { display: inline-flex; align-items: center; gap: 0.5rem; border: none; background: #0b57d0; color: #fff; border-radius: 8px; padding: 0.65rem 1.25rem; font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: background 0.15s ease; }
.create-btn:hover { background: #094cb4; }

/* Search and filter control panel */
.search-filter-bar { display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; }
.search-input-wrapper { display: flex; align-items: center; gap: 0.55rem; border: 1px solid #cbd5e1; border-radius: 8px; background: #f8faff; padding: 0.65rem 1rem; flex: 1; max-width: 420px; transition: all 0.2s ease; }
.search-input-wrapper:focus-within { border-color: #0b57d0; box-shadow: 0 0 0 2px rgba(11, 87, 208, 0.1); background: #ffffff; }
.search-icon { flex-shrink: 0; }
.search-input { width: 100%; border: none; background: transparent; outline: none; font-size: 0.9rem; color: #0f172a; font-family: inherit; }

/* Tab buttons container */
.tabs-container { display: flex; align-items: center; border: 1px solid #cbd5e1; border-radius: 8px; background: #ffffff; padding: 0.3rem; gap: 0.25rem; }
.tab-btn { border: none; background: transparent; padding: 0.45rem 1rem; font-size: 0.8rem; font-weight: 600; cursor: pointer; border-radius: 6px; color: #475569; transition: all 0.2s ease; }
.tab-btn:hover:not(.active) { background: #f1f5f9; color: #0f172a; }
.tab-btn.active { background: #0b57d0; color: #ffffff; }
.tab-divider { width: 1px; height: 18px; background: #cbd5e1; margin: 0 0.25rem; }
.settings-filter-btn { border: none; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0.25rem 0.5rem; border-radius: 4px; }
.settings-filter-btn:hover { background: #f1f5f9; }

.loading-wrap { padding: 4rem; display: flex; align-items: center; justify-content: center; }

/* Table container card */
.table-card { padding: 0; overflow: hidden; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05); background: #ffffff; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; padding: 1.1rem 1.5rem; font-size: 0.9rem; color: #334155; font-weight: 600; border-bottom: 1px solid #e2e8f0; background: #f8fafc; }
.data-table td { padding: 1.5rem 1.5rem; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }
.data-table tbody tr:last-child td { border-bottom: none; }

/* Gig details column layout */
.gig-cell { display: flex; gap: 1.1rem; align-items: flex-start; min-width: 320px; }
.gig-media-container { width: 98px; height: 62px; flex-shrink: 0; border-radius: 6px; overflow: hidden; border: 1px solid #cbd5e1; }
.gig-media-container.placeholder { background: #f1f5f9; border: 1px dashed #cbd5e1; display: flex; align-items: center; justify-content: center; color: #94a3b8; }
.gig-thumbnail { width: 100%; height: 100%; object-fit: cover; }
.gig-info { display: flex; flex-direction: column; gap: 0.2rem; }
.gig-title { font-weight: 700; color: #0f172a; font-size: 0.95rem; line-height: 1.35; }
.gig-desc { font-size: 0.85rem; color: #475569; line-height: 1.4; }
.gig-meta { display: flex; gap: 1rem; margin-top: 0.25rem; }
.meta-item { display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.78rem; color: #64748b; font-weight: 600; }
.meta-item.text-only { font-size: 0.78rem; color: #64748b; font-weight: 600; }
.meta-icon { opacity: 0.75; }

/* Status cell */
.status-badge { display: inline-flex; align-items: center; gap: 0.35rem; border-radius: 999px; padding: 0.25rem 0.75rem; font-size: 0.78rem; font-weight: 600; }
.status-badge.active { background: #eff6ff; color: #0b57d0; border: 1px solid #bfdbfe; }
.status-badge.active .status-dot { background: #0b57d0; }
.status-badge.draft { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
.status-badge.draft .status-dot { background: #475569; }
.status-dot { width: 6px; height: 6px; border-radius: 50%; }

/* Price cell */
.price-cell { font-family: inherit; }
.price-lbl { font-size: 0.8rem; color: #64748b; margin-bottom: 2px; }
.price-val { font-weight: 700; color: #0f172a; font-size: 1.15rem; }
.price-val.dash { font-weight: 500; color: #94a3b8; }
.price-sub { font-size: 0.78rem; color: #64748b; margin-top: 2px; }

/* Actions cell */
.actions-cell { white-space: nowrap; }
.actions-row { display: flex; gap: 0.5rem; }
.action-btn { background: none; border: 1px solid #cbd5e1; border-radius: 6px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: #64748b; cursor: pointer; transition: all 0.15s ease; }
.action-btn:hover { background: #f1f5f9; color: #0f172a; border-color: #94a3b8; }
.action-btn.delete:hover { background: #fee2e2; color: #dc2626; border-color: #fca5a5; }

/* Pagination footer */
.table-footer { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; border-top: 1px solid #e2e8f0; background: #f8fafc; }
.pagination-info { font-size: 0.875rem; color: #475569; }
.pagination-btns { display: flex; gap: 0.35rem; }
.page-btn { width: 32px; height: 32px; border: 1px solid #cbd5e1; border-radius: 6px; background: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #334155; transition: all 0.2s ease; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; border-color: #e2e8f0; }
.page-btn:not(:disabled):hover { background: #f1f5f9; border-color: #94a3b8; }

@media (max-width: 820px) {
  .search-filter-bar { flex-direction: column; align-items: stretch; }
  .search-input-wrapper { max-width: none; }
  .tabs-container { justify-content: center; }
}
</style>
