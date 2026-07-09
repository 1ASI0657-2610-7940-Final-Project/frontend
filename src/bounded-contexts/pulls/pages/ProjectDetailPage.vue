<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../../app/stores/authStore'
import { useEngagementStore } from '@pulls/stores/engagementStore'
import type { ProjectStatus } from '@pulls/types/engagement.types'
import ReportUserModal from '@chat/components/ReportUserModal.vue'
import { chatApi } from '@chat/api/chatApi'
import LoadingState from '../../../shared/components/LoadingState.vue'
import ErrorState from '../../../shared/components/ErrorState.vue'
import EmptyState from '../../../shared/components/EmptyState.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const store = useEngagementStore()
const openReportModal = ref(false)

const projectId = computed(() => route.params.id as string)

const project = computed(() => store.selectedProject)
const shortId = (value: string) => (value ? value.slice(0, 8).toUpperCase() : '--')
const isClient = computed(() => auth.isClient)
const isFreelancer = computed(() => auth.isFreelancer)

// Deliverables Checklist state (interactive)
const checklist = ref([
  { id: '1', label: 'Low-fidelity wireframes', completed: true },
  { id: '2', label: 'Design System / Style Guide', completed: true },
  { id: '3', label: 'High-fidelity App screens', completed: false },
  { id: '4', label: 'Interactive Figma Prototype', completed: false }
])

const revieweeId = computed(() => {
  if (!project.value) return ''
  if (!auth.user) return project.value.freelancerId || project.value.clientId || ''
  return isClient.value ? project.value.freelancerId : project.value.clientId
})

const canMarkDelivered = computed(() => isFreelancer.value && project.value?.status === 'IN_PROGRESS')
const canMarkCompleted = computed(() => isClient.value && project.value?.status === 'DELIVERED')
const messageButtonLabel = computed(() => (isClient.value ? 'Message Freelancer' : 'Message Client'))
const statusActionLabel = computed(() => (canMarkCompleted.value ? 'Mark Completed' : 'Mark Delivered'))

const load = async () => {
  store.error = null
  
  try {
    await store.fetchProjectById(projectId.value)
  } catch (err) {
    console.warn('fetchProjectById failed:', err)
  }

  try {
    await store.fetchProjectReviews(projectId.value)
  } catch (err) {
    console.warn('fetchProjectReviews failed:', err)
  }

  store.error = null
}

const markDelivered = async () => {
  if (!project.value) return
  try {
    await store.updateProjectStatus(projectId.value, { status: 'DELIVERED' })
    await load()
  } catch (e) {
    console.error('Failed to update project status:', e)
  }
}

const markCompleted = async () => {
  if (!project.value) return
  try {
    await store.updateProjectStatus(projectId.value, { status: 'FINISHED' })
    await load()
  } catch (e) {
    console.error('Failed to complete project:', e)
  }
}

const openChat = async () => {
  if (!project.value || !revieweeId.value) return
  try {
    const created = await chatApi.createConversation({
      participantId: revieweeId.value,
      projectId: project.value.id
    })
    await router.push(`/chat?conversationId=${created.id}`)
  } catch (e) {
    console.warn('Failed to create conversation on backend, navigating to chat anyway.', e)
    await router.push('/chat')
  }
}

const formatPrice = (price: number, currency: string) => {
  const symbol = currency === 'USD' ? '$' : currency + ' '
  return symbol + price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

const formatDateTime = (isoString: string) => {
  const d = new Date(isoString)
  if (isNaN(d.getTime())) return isoString
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
  const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true }
  return `${d.toLocaleDateString('en-US', options)} • ${d.toLocaleTimeString('en-US', timeOptions)}`
}

const hasStatusInHistory = (status: ProjectStatus) => {
  return project.value?.statusHistory?.some((h) => h.status === status) || false
}

const getStatusTimeInHistory = (status: ProjectStatus) => {
  const found = project.value?.statusHistory?.find((h) => h.status === status)
  return found ? formatDateTime(found.changedAt) : ''
}

onMounted(load)
</script>

<template>
  <section class="project-detail-page">
    <ErrorState v-if="store.error" :message="store.error" />
    <LoadingState v-else-if="store.loading" />

    <EmptyState
      v-else-if="!project"
      title="No project found"
      message="This project has no real record yet."
    />

    <template v-else>
      <!-- Breadcrumbs & Header -->
      <header class="page-header">
        <div class="header-left">
          <nav class="breadcrumbs">
            <span>Projects</span>
            <span class="separator">&gt;</span>
            <span class="current">{{ project.id }}</span>
          </nav>
          <h1 class="project-title">{{ project.serviceId }}</h1>
        </div>
        <div class="header-right">
          <button class="btn-message" @click="openChat">{{ messageButtonLabel }}</button>
          <button 
            v-if="canMarkDelivered || canMarkCompleted"
            class="btn-deliver" 
            @click="canMarkCompleted ? markCompleted() : markDelivered()"
          >
            <!-- White Check Icon Inside Circle -->
            <svg class="deliver-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" fill="white" stroke="currentColor"/>
              <polyline points="16 9 11 14 8 11" stroke="#2563eb"/>
            </svg>
            {{ statusActionLabel }}
          </button>
          <button v-else-if="project.status === 'DELIVERED'" class="btn-deliver" disabled>
            Delivered
          </button>
          <button v-else-if="project.status === 'FINISHED'" class="btn-deliver" disabled>
            Completed
          </button>
          <button v-else class="btn-deliver" @click="openReportModal = true">
            Report User
          </button>
        </div>
      </header>

      <!-- Main Columns Grid Layout -->
      <div class="project-grid">
        <!-- Left Column (Brief & Timeline) -->
        <div class="main-column">
          <!-- Project Brief Card -->
          <article class="card brief-card">
            <header class="card-header">
              <h2 class="card-title">Project Brief</h2>
              <span class="status-pill" :class="project.status.toLowerCase()">
                <span class="status-dot"></span>
                {{ project.status === 'IN_PROGRESS' ? 'IN PROGRESS' : project.status }}
              </span>
            </header>

            <div class="brief-body">
              <p class="description-text">
                No additional project brief is available from the backend for this engagement.
              </p>
              <h3 class="deliverables-title">Key deliverables include:</h3>
              <ul class="deliverables-list">
                <li>No deliverables were provided for this project.</li>
              </ul>
            </div>

            <div class="brief-metrics">
              <div class="metric-item">
                <span class="metric-label">Budget</span>
                <span class="metric-value budget">{{ formatPrice(project.finalPrice, project.currency) }}</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">Timeline</span>
                <span class="metric-value">Not set</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">Deadline</span>
                <span class="metric-value">Not set</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">Agreement ID</span>
                <span class="metric-value">{{ shortId(project.id) }}</span>
              </div>
            </div>
          </article>

          <!-- Project Timeline Card -->
          <article class="card timeline-card">
            <h2 class="card-title">Project Timeline</h2>

            <div class="timeline-container">
              <!-- Item 1: Project Accepted -->
              <div class="timeline-item" :class="{ completed: hasStatusInHistory('PENDING') }">
                <div class="timeline-badge">
                  <svg v-if="hasStatusInHistory('PENDING')" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span v-else class="empty-dot"></span>
                </div>
                <div class="timeline-content">
                  <div class="timeline-header">
                    <h4 class="timeline-title">Project Accepted</h4>
                    <span class="timeline-time">{{ getStatusTimeInHistory('PENDING') || 'Oct 3, 2024 • 09:41 AM' }}</span>
                  </div>
                  <p class="timeline-desc">Agreement signed by both parties. Initial deposit secured in escrow.</p>
                </div>
              </div>

              <!-- Item 2: In Progress -->
              <div class="timeline-item" :class="{ active: project.status === 'IN_PROGRESS', completed: hasStatusInHistory('IN_PROGRESS') && project.status !== 'IN_PROGRESS' }">
                <div class="timeline-badge">
                  <span v-if="project.status === 'IN_PROGRESS'" class="active-dot"></span>
                  <svg v-else-if="hasStatusInHistory('IN_PROGRESS')" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span v-else class="empty-dot"></span>
                </div>
                <div class="timeline-content">
                  <div class="timeline-header">
                    <h4 class="timeline-title">In Progress</h4>
                    <span class="timeline-time">{{ getStatusTimeInHistory('IN_PROGRESS') || 'Oct 5, 2024 • 14:20 PM' }}</span>
                  </div>
                  <p class="timeline-desc">Wireframes approved. Moving to high-fidelity UI design phase.</p>
                </div>
              </div>

              <!-- Item 3: Delivered -->
              <div class="timeline-item" :class="{ active: project.status === 'DELIVERED', completed: hasStatusInHistory('DELIVERED') && project.status !== 'DELIVERED' }">
                <div class="timeline-badge">
                  <span v-if="project.status === 'DELIVERED'" class="active-dot"></span>
                  <svg v-else-if="hasStatusInHistory('DELIVERED')" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span v-else class="empty-dot"></span>
                </div>
                <div class="timeline-content">
                  <div class="timeline-header">
                    <h4 class="timeline-title">Delivered</h4>
                    <span class="timeline-time">{{ getStatusTimeInHistory('DELIVERED') || 'Pending Submission' }}</span>
                  </div>
                </div>
              </div>

              <!-- Item 4: Finished -->
              <div class="timeline-item" :class="{ active: project.status === 'FINISHED' }">
                <div class="timeline-badge">
                  <span v-if="project.status === 'FINISHED'" class="active-dot"></span>
                  <span v-else class="empty-dot"></span>
                </div>
                <div class="timeline-content">
                  <div class="timeline-header">
                    <h4 class="timeline-title">Finished</h4>
                    <span class="timeline-time">{{ getStatusTimeInHistory('FINISHED') || 'Awaiting Client Approval' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>

        <!-- Right Column (Sidebar: Client info & Checklist) -->
        <div class="side-column">
          <!-- Client Information Card -->
          <article class="client-card">
            <span class="client-card-label">CLIENT INFORMATION</span>
            
            <div class="client-profile">
              <div class="client-logo">{{ shortId(project.clientId).slice(0, 2) }}</div>
              <div class="client-meta">
                <h3 class="client-name">{{ project.clientId }}</h3>
                <span class="client-verified">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="#2563eb" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  Project participant
                </span>
              </div>
            </div>

            <div class="client-details">
              <div class="detail-row">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <div class="detail-text">
                  <span class="primary-text">Freelancer ID</span>
                  <span class="secondary-text">{{ project.freelancerId }}</span>
                </div>
              </div>
              <div class="detail-row">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <div class="detail-text">
                  <span class="primary-text">Client ID</span>
                  <span class="secondary-text">{{ project.clientId }}</span>
                </div>
              </div>
              <div class="detail-row">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <div class="detail-text">
                  <span class="primary-text">Project ID</span>
                  <span class="secondary-text">{{ project.id }}</span>
                </div>
              </div>
            </div>
          </article>

          <!-- Deliverables Checklist Card -->
          <article class="card checklist-card">
            <h3 class="checklist-title">Deliverables Checklist</h3>
            <div class="checklist-list">
              <label 
                v-for="item in checklist" 
                :key="item.id" 
                class="checklist-item" 
                :class="{ checked: item.completed }"
              >
                <input type="checkbox" v-model="item.completed" class="hidden-checkbox" />
                <span class="custom-checkbox">
                  <svg v-if="item.completed" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </span>
                <span class="checklist-text">{{ item.label }}</span>
              </label>
            </div>
          </article>
        </div>
      </div>
    </template>

    <ReportUserModal :open="openReportModal" :reported-user-id="revieweeId" @close="openReportModal = false" />
  </section>
</template>

<style scoped>
.project-detail-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #0f172a;
}

/* Header & Breadcrumbs */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
}
.header-left {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: #64748b;
  font-weight: 500;
}
.breadcrumbs .separator {
  color: #94a3b8;
  font-size: 0.75rem;
}
.breadcrumbs .current {
  color: #0f172a;
  font-weight: 600;
}
.project-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.025em;
  margin: 0;
}
.header-right {
  display: flex;
  gap: 0.75rem;
}
.btn-message {
  background: #ffffff;
  border: 2px solid #2563eb;
  color: #2563eb;
  font-weight: 700;
  font-size: 0.875rem;
  padding: 0.65rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.btn-message:hover {
  background: #eff6ff;
}
.btn-deliver {
  background: #2563eb;
  border: none;
  color: #ffffff;
  font-weight: 700;
  font-size: 0.875rem;
  padding: 0.65rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.15s ease;
}
.btn-deliver:hover:not(:disabled) {
  background: #1d4ed8;
}
.btn-deliver:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

/* Grid Layout */
.project-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  align-items: start;
}

.main-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.side-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Card base */
.card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.02);
}

/* Project Brief Card */
.brief-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}
.card-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}
.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.85rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  gap: 0.35rem;
  letter-spacing: 0.025em;
}
.status-pill.in_progress {
  background: #eff6ff;
  color: #1d4ed8;
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #2563eb;
}
.description-text {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #475569;
  margin: 0 0 1.25rem 0;
}
.deliverables-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #334155;
  margin: 0 0 0.5rem 0;
}
.deliverables-list {
  margin: 0 0 2rem 0;
  padding-left: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  color: #475569;
  font-size: 0.925rem;
}
.deliverables-list li {
  line-height: 1.5;
}

.brief-metrics {
  border-top: 1px solid #f1f5f9;
  padding-top: 1.5rem;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}
.metric-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.metric-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: capitalize;
}
.metric-value {
  font-size: 0.95rem;
  font-weight: 700;
  color: #334155;
}
.metric-value.budget {
  font-size: 1.25rem;
  color: #2563eb;
}

/* Timeline Card */
.timeline-card {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}
.timeline-container {
  position: relative;
  display: flex;
  flex-direction: column;
  padding-left: 1rem;
}
.timeline-container::before {
  content: '';
  position: absolute;
  left: 19px;
  top: 10px;
  bottom: 24px;
  width: 2px;
  background: #cbd5e1;
  z-index: 1;
}

.timeline-item {
  position: relative;
  display: flex;
  gap: 1.5rem;
  padding-bottom: 2rem;
  z-index: 2;
}
.timeline-item:last-child {
  padding-bottom: 0;
}

/* Dynamic Line Coloring */
.timeline-item.completed::after {
  content: '';
  position: absolute;
  left: 9px;
  top: 24px;
  bottom: -10px;
  width: 2px;
  background: #2563eb;
  z-index: -1;
}

.timeline-badge {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ffffff;
  border: 2px solid #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-sizing: border-box;
}

.timeline-item.completed .timeline-badge {
  background: #2563eb;
  border-color: #2563eb;
  color: white;
}

.timeline-item.active .timeline-badge {
  border-color: #2563eb;
  background: #ffffff;
}

.active-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2563eb;
}

.empty-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #94a3b8;
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex-grow: 1;
}
.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.timeline-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #64748b;
  margin: 0;
}
.timeline-item.active .timeline-title {
  color: #2563eb;
}
.timeline-item.completed .timeline-title {
  color: #0f172a;
}
.timeline-time {
  font-size: 0.8125rem;
  color: #94a3b8;
}
.timeline-item.active .timeline-time {
  color: #64748b;
  font-weight: 500;
}
.timeline-desc {
  font-size: 0.875rem;
  color: #475569;
  line-height: 1.5;
  margin: 0;
}

/* Sidebar Columns */
/* Client Card (Blue background) */
.client-card {
  background: #f0f4ff;
  border-radius: 16px;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.client-card-label {
  font-size: 0.6875rem;
  font-weight: 700;
  color: #475569;
  letter-spacing: 0.05em;
}
.client-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.client-logo {
  width: 48px;
  height: 48px;
  background: #ffffff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 800;
  color: #1e3a8a;
  border: 1px solid #e2e8f0;
}
.client-meta {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.client-name {
  font-size: 1.15rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}
.client-verified {
  display: inline-flex;
  align-items: center;
  font-size: 0.78rem;
  color: #2563eb;
  font-weight: 700;
  gap: 0.25rem;
}

.client-details {
  border-top: 1px solid #e2e8f0;
  padding-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.detail-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}
.detail-text {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}
.detail-text .primary-text {
  font-size: 0.875rem;
  font-weight: 700;
  color: #334155;
}
.detail-text .secondary-text {
  font-size: 0.75rem;
  color: #64748b;
}

/* Deliverables Checklist */
.checklist-card {
  padding: 1.5rem !important;
}
.checklist-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 1rem 0;
}
.checklist-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}
.checklist-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
}
.hidden-checkbox {
  display: none;
}
.custom-checkbox {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s ease;
}
.checklist-item.checked .custom-checkbox {
  background: #2563eb;
  border-color: #2563eb;
}
.checklist-text {
  font-size: 0.875rem;
  color: #1e293b;
  font-weight: 500;
  transition: all 0.15s ease;
}
.checklist-item.checked .checklist-text {
  text-decoration: line-through;
  color: #94a3b8;
}

@media (max-width: 960px) {
  .project-grid {
    grid-template-columns: 1fr;
  }
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
}
</style>
