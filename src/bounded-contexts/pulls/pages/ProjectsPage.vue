<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useEngagementStore } from '@pulls/stores/engagementStore'
import { useAuthStore } from '../../../app/stores/authStore'
import LoadingState from '../../../shared/components/LoadingState.vue'
import EmptyState from '../../../shared/components/EmptyState.vue'
import ErrorState from '../../../shared/components/ErrorState.vue'

const router = useRouter()
const store = useEngagementStore()
const authStore = useAuthStore()

const selectedStatus = ref<'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('ALL')
const searchQuery = ref('')
const PAGE_SIZE = 4
const currentPage = ref(1)
const mappedProjects = computed(() => {
  if (store.projects && store.projects.length > 0) {
    return store.projects.map((p) => {
      let iconType: 'CODE' | 'DOC' | 'TRANS' | 'MEGAPHONE' = 'DOC'
      const title = p.serviceId || 'Freelance Service'
      const titleLower = title.toLowerCase()
      if (titleLower.includes('web') || titleLower.includes('app') || titleLower.includes('code') || titleLower.includes('development') || titleLower.includes('api')) {
        iconType = 'CODE'
      } else if (titleLower.includes('translate') || titleLower.includes('translation') || titleLower.includes('language')) {
        iconType = 'TRANS'
      } else if (titleLower.includes('marketing') || titleLower.includes('campaign') || titleLower.includes('social')) {
        iconType = 'MEGAPHONE'
      }

      const isClient = p.clientId === authStore.user?.id
      return {
        id: p.id,
        title: p.serviceId,
        iconType,
        name: isClient ? p.freelancerId : p.clientId,
        role: isClient ? 'Freelancer' : 'Client',
        avatar: null,
        status: p.status,
        finalPrice: p.finalPrice,
        currency: p.currency || 'USD'
      }
    })
  }
  return []
})

const filtered = computed(() => {
  let list = mappedProjects.value

  // Tab filter
  if (selectedStatus.value === 'ACTIVE') {
    list = list.filter((p) => p.status === 'IN_PROGRESS' || p.status === 'PENDING')
  } else if (selectedStatus.value === 'COMPLETED') {
    list = list.filter((p) => p.status === 'FINISHED' || p.status === 'DELIVERED')
  } else if (selectedStatus.value === 'CANCELLED') {
    list = list.filter((p) => p.status === 'CANCELLED')
  }

  // Search filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter((p) => 
      p.id.toLowerCase().includes(q) || 
      p.title.toLowerCase().includes(q) || 
      p.name.toLowerCase().includes(q)
    )
  }

  return list
})

const totalPages = computed(() => Math.ceil(filtered.value.length / PAGE_SIZE))
const pagedProjects = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filtered.value.slice(start, start + PAGE_SIZE)
})

const startItem = computed(() => filtered.value.length === 0 ? 0 : (currentPage.value - 1) * PAGE_SIZE + 1)
const endItem = computed(() => Math.min(currentPage.value * PAGE_SIZE, filtered.value.length))
const totalItems = computed(() => filtered.value.length)

const paginationPages = computed(() => {
  const pages: (number | string)[] = []
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 5) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) {
      pages.push('...')
    }
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) pages.push(i)
    }
    if (current < total - 2) {
      pages.push('...')
    }
    if (!pages.includes(total)) pages.push(total)
  }
  return pages
})

watch([selectedStatus, searchQuery], () => {
  currentPage.value = 1
})

const formatPrice = (price: number, currency: string) => {
  const symbol = currency === 'USD' ? '$' : currency + ' '
  return symbol + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const getStatusClass = (status: string) => {
  if (status === 'IN_PROGRESS' || status === 'PENDING') return 'active'
  if (status === 'FINISHED' || status === 'DELIVERED') return 'completed'
  if (status === 'CANCELLED') return 'cancelled'
  return 'active'
}

const getStatusLabel = (status: string) => {
  if (status === 'IN_PROGRESS' || status === 'PENDING') return 'Active'
  if (status === 'FINISHED' || status === 'DELIVERED') return 'Completed'
  if (status === 'CANCELLED') return 'Cancelled'
  return status
}

onMounted(async () => {
  try {
    await store.fetchProjects()
  } catch (e) {
    console.warn('Backend fetchProjects failed.', e)
  }
})
</script>

<template>
  <section class="projects-page">
    <header class="page-header">
      <h1 class="page-title">Projects List</h1>
      <p class="page-subtitle">Manage and track the status of your active and past engagements.</p>
    </header>

    <!-- Filters Container -->
    <div class="filters-card">
      <div class="filter-tabs">
        <button 
          class="tab-btn" 
          :class="{ active: selectedStatus === 'ALL' }" 
          @click="selectedStatus = 'ALL'"
        >
          All Projects
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: selectedStatus === 'ACTIVE' }" 
          @click="selectedStatus = 'ACTIVE'"
        >
          Active
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: selectedStatus === 'COMPLETED' }" 
          @click="selectedStatus = 'COMPLETED'"
        >
          Completed
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: selectedStatus === 'CANCELLED' }" 
          @click="selectedStatus = 'CANCELLED'"
        >
          Cancelled
        </button>
      </div>

      <div class="search-box">
        <!-- Search Magnifying Glass SVG -->
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search service ID or client..." 
          class="search-input" 
        />
      </div>
    </div>

    <!-- Error/Loading/Empty States -->
    <ErrorState v-if="store.error" :message="store.error" />
    <LoadingState v-else-if="store.loading" />
    <EmptyState v-else-if="!filtered.length" title="No projects found" message="There are no projects matching this filter." />

    <!-- Table Card -->
    <div class="card table-card" v-else>
      <div class="table-wrap">
        <table class="projects-table">
          <thead>
            <tr>
              <th>SERVICE ID</th>
              <th>CLIENT / FREELANCER</th>
              <th>STATUS</th>
              <th>FINAL PRICE</th>
              <th class="action-header">ACTION</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="project in pagedProjects" :key="project.id">
              <!-- Service ID Column -->
              <td>
                <div class="service-id-cell">
                  <div class="icon-wrap" :class="project.iconType.toLowerCase()">
                    <!-- SVG depending on iconType -->
                    <svg v-if="project.iconType === 'CODE'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
                    </svg>
                    <svg v-else-if="project.iconType === 'DOC'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <svg v-else-if="project.iconType === 'TRANS'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>
                    </svg>
                    <svg v-else-if="project.iconType === 'MEGAPHONE'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                    </svg>
                  </div>
                  <div class="service-id-info">
                    <span class="service-id-text">{{ project.id }}</span>
                    <span class="service-title">{{ project.title }}</span>
                  </div>
                </div>
              </td>

              <!-- Client / Freelancer Column -->
              <td>
                <div class="user-cell">
                  <img v-if="project.avatar" :src="project.avatar" class="avatar-img" alt="Avatar" />
                  <div v-else class="avatar-placeholder">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div class="user-info">
                    <span class="user-name">{{ project.name }}</span>
                    <span class="user-role">{{ project.role }}</span>
                  </div>
                </div>
              </td>

              <!-- Status Column -->
              <td>
                <span class="status-pill" :class="getStatusClass(project.status)">
                  <!-- Status Dot or Check or X depending on state -->
                  <span v-if="getStatusClass(project.status) === 'active'" class="status-dot"></span>
                  <svg v-else-if="getStatusClass(project.status) === 'completed'" class="status-check" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <svg v-else-if="getStatusClass(project.status) === 'cancelled'" class="status-x" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  {{ getStatusLabel(project.status) }}
                </span>
              </td>

              <!-- Price Column -->
              <td>
                <span class="price-text" :class="{ 'cancelled-price': getStatusClass(project.status) === 'cancelled' }">
                  {{ formatPrice(project.finalPrice, project.currency) }}
                </span>
              </td>

              <!-- Action Column -->
              <td class="action-cell">
                <button class="view-btn" @click="router.push(`/projects/${project.id}`)">View Detail</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <footer class="table-footer">
        <span class="footer-count">
          Showing {{ startItem }} to {{ endItem }} of {{ totalItems }} projects
        </span>

        <!-- Pagination Controls -->
        <div class="pagination-controls" v-if="totalPages > 1">
          <button 
            class="page-btn" 
            :disabled="currentPage === 1" 
            @click="currentPage--"
            aria-label="Previous page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          
          <template v-for="(p, index) in paginationPages" :key="index">
            <button 
              v-if="typeof p === 'number'"
              class="page-btn" 
              :class="{ active: currentPage === p }" 
              @click="currentPage = p"
            >
              {{ p }}
            </button>
            <span v-else class="page-ellipsis">...</span>
          </template>

          <button 
            class="page-btn" 
            :disabled="currentPage === totalPages" 
            @click="currentPage++"
            aria-label="Next page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </footer>
    </div>
  </section>
</template>

<style scoped>
.projects-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #0f172a;
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.page-title {
  font-size: 2.25rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.025em;
  margin: 0;
}

.page-subtitle {
  font-size: 0.95rem;
  color: #64748b;
  margin: 0;
}

/* Filters Card Container */
.filters-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.02);
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
}

.tab-btn {
  background: transparent;
  border: 1px solid transparent;
  color: #475569;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tab-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.tab-btn.active {
  background: #0056b3;
  color: #ffffff;
  font-weight: 600;
}

/* Search Box */
.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.85rem;
  pointer-events: none;
}

.search-input {
  width: 280px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0.5rem 1rem 0.5rem 2.25rem;
  font-size: 0.875rem;
  font-family: inherit;
  color: #0f172a;
  outline: none;
  transition: all 0.15s ease;
}

.search-input:focus {
  background: #ffffff;
  border-color: #0056b3;
  box-shadow: 0 0 0 2px rgba(0, 86, 179, 0.08);
}

/* Table Card */
.table-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
}

.table-wrap {
  overflow-x: auto;
}

.projects-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.projects-table th {
  background: #f8fafc;
  padding: 0.85rem 1.5rem;
  font-size: 0.6875rem;
  font-weight: 700;
  color: #475569;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e2e8f0;
}

.projects-table td {
  padding: 1.15rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.projects-table tr:last-child td {
  border-bottom: none;
}

/* Service ID Cell */
.service-id-cell {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-wrap.code {
  background: #eff6ff;
  color: #2563eb;
}

.icon-wrap.doc {
  background: #f1f5f9;
  color: #64748b;
}

.icon-wrap.trans {
  background: #fdf2f8;
  color: #db2777;
}

.icon-wrap.megaphone {
  background: #ecfdf5;
  color: #059669;
}

.service-id-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.service-id-text {
  font-size: 0.875rem;
  font-weight: 700;
  color: #0f172a;
}

.service-title {
  font-size: 0.78rem;
  color: #64748b;
}

/* User Cell */
.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar-img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #eff6ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #0f172a;
}

.user-role {
  font-size: 0.75rem;
  color: #64748b;
}

/* Status Pill */
.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8125rem;
  font-weight: 600;
  gap: 0.35rem;
}

.status-pill.active {
  background: #eff6ff;
  color: #1d4ed8;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #2563eb;
}

.status-pill.completed {
  background: #f0fdf4;
  color: #15803d;
}

.status-check {
  color: #16a34a;
  stroke-width: 3;
}

.status-pill.cancelled {
  background: #fef2f2;
  color: #b91c1c;
}

.status-x {
  color: #dc2626;
  stroke-width: 3;
}

/* Price */
.price-text {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0056b3;
}

.price-text.cancelled-price {
  color: #94a3b8;
  font-weight: 500;
}

/* View Button */
.action-cell {
  text-align: right;
  padding-right: 1.5rem;
}

.action-header {
  text-align: right;
  padding-right: 1.5rem !important;
}

.view-btn {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #0056b3;
  font-weight: 600;
  font-size: 0.8125rem;
  padding: 0.45rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.view-btn:hover {
  background: #eff6ff;
  border-color: #0056b3;
}

/* Footer / Pagination */
.table-footer {
  border-top: 1px solid #f1f5f9;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-count {
  font-size: 0.8125rem;
  color: #64748b;
}

.pagination-controls {
  display: flex;
  gap: 0.35rem;
  align-items: center;
}

.page-btn {
  width: 28px;
  height: 28px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #475569;
  font-size: 0.8125rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.page-btn:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #94a3b8;
}

.page-btn.active {
  background: #0056b3;
  color: #ffffff;
  border: none;
}

.page-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.page-ellipsis {
  color: #94a3b8;
  font-size: 0.8125rem;
  padding: 0 0.25rem;
}

@media (max-width: 768px) {
  .filters-card {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  .search-input {
    width: 100%;
  }
  .table-footer {
    flex-direction: column;
    gap: 0.75rem;
    align-items: center;
  }
}
</style>
