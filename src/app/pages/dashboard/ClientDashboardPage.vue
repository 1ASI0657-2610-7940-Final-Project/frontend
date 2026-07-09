<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useEngagementStore } from '@pulls/stores/engagementStore'
import type { Project } from '@pulls/types/engagement.types'

const store = useEngagementStore()

// Estados que cuentan como proyecto "en curso" para el cliente.
const ACTIVE_STATUSES = ['PENDING', 'IN_PROGRESS', 'DELIVERED']

const shortId = (id: string) => (id ? id.slice(0, 8) : '')
const initialsOf = (id: string) => (id ? id.replace(/-/g, '').slice(0, 2).toUpperCase() : '--')

const statusView = (status: string) => {
  switch (status) {
    case 'IN_PROGRESS': return { label: 'In Progress', color: '#3b5bdb', bg: '#eef2ff' }
    case 'DELIVERED': return { label: 'In Review', color: '#6366f1', bg: '#eef2ff' }
    case 'PENDING': return { label: 'Pending', color: '#d97706', bg: '#fef3c7' }
    default: return { label: status, color: '#64748b', bg: '#f1f5f9' }
  }
}

const completedDateOf = (p: Project) => {
  const h = p.statusHistory?.find((x) => x.status === 'FINISHED')
  return h ? new Date(h.changedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'
}

const formatMoney = (amount: number, currency: string) => {
  const symbol = currency === 'USD' ? '$' : (currency ? currency + ' ' : '$')
  return symbol + amount.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

const activeProjects = computed(() => {
  return store.projects
    .filter((p) => ACTIVE_STATUSES.includes(p.status))
    .map((p) => {
      const s = statusView(p.status)
      return {
        title: p.serviceId || 'Freelance Service',
        subtitle: `#${shortId(p.id)}`,
        initials: initialsOf(p.freelancerId),
        freelancer: p.freelancerId,
        dueDate: '—',
        status: s.label,
        statusColor: s.color,
        statusBg: s.bg,
      }
    })
})

const recentlyCompleted = computed(() => {
  return store.projects
    .filter((p) => p.status === 'FINISHED')
    .map((p) => ({
      title: p.serviceId || 'Freelance Service',
      freelancer: p.freelancerId,
      completedDate: completedDateOf(p),
    }))
})

const stats = computed(() => {
  const activeRequests = store.outgoingRequests.filter((r) => r.status === 'PENDING').length
  const ongoing = store.projects.filter((p) => ACTIVE_STATUSES.includes(p.status)).length
  const finished = store.projects.filter((p) => p.status === 'FINISHED')
  const spent = finished.reduce((sum, p) => sum + (p.finalPrice || 0), 0)
  const currency = finished[0]?.currency || 'USD'
  return [
    { label: 'ACTIVE REQUESTS', value: String(activeRequests), sub: 'Awaiting response', subColor: '#64748b', icon: 'inbox' },
    { label: 'ONGOING PROJECTS', value: String(ongoing), sub: 'In progress', subColor: '#64748b', icon: 'folder' },
    { label: 'TOTAL SPENT', value: formatMoney(spent, currency), sub: 'Completed projects', subColor: '#64748b', icon: 'wallet' },
  ]
})

onMounted(() => {
  Promise.allSettled([store.fetchProjects(), store.fetchOutgoingRequests()])
})
</script>

<template>
  <div class="overview">
    <div class="overview-header">
      <div>
        <h1 class="overview-title">Overview</h1>
        <p class="overview-sub muted">Track your outgoing requests and active engagements.</p>
      </div>
      <button class="export-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Export Report
      </button>
    </div>

    <div class="stats-grid">
      <div v-for="stat in stats" :key="stat.label" class="stat-card card">
        <div class="stat-body">
          <span class="stat-label">{{ stat.label }}</span>
          <span class="stat-value">{{ stat.value }}</span>
          <span class="stat-sub" :style="{ color: stat.subColor }">{{ stat.sub }}</span>
        </div>
        <div class="stat-icon-wrap">
          <svg v-if="stat.icon === 'inbox'" xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.18"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
          <svg v-else-if="stat.icon === 'folder'" xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.18"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.18"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
        </div>
      </div>
    </div>

    <div class="main-grid">
      <div class="card table-card">
        <div class="table-header">
          <h3 class="table-title">Active Projects</h3>
          <RouterLink to="/projects" class="view-all">View All</RouterLink>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Project Details</th>
              <th>Freelancer</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!activeProjects.length">
              <td colspan="5" class="empty-row">No active projects yet.</td>
            </tr>
            <tr v-else v-for="(p, i) in activeProjects" :key="i">
              <td>
                <div class="project-title">{{ p.title }}</div>
                <div class="project-sub muted">{{ p.subtitle }}</div>
              </td>
              <td>
                <div class="freelancer-cell">
                  <div class="f-avatar">{{ p.initials }}</div>
                  <span>{{ p.freelancer }}</span>
                </div>
              </td>
              <td class="date-cell muted">{{ p.dueDate }}</td>
              <td>
                <span class="status-badge" :style="{ color: p.statusColor, background: p.statusBg }">
                  <span class="status-dot" :style="{ background: p.statusColor }"></span>
                  {{ p.status }}
                </span>
              </td>
              <td>
                <RouterLink to="/projects" class="action-link">View</RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card tip-card">
        <div class="tip-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
        </div>
        <div class="tip-body">
          <p class="tip-title">Approve faster, hire better</p>
          <p class="tip-text muted">Projects that are reviewed within 24 hours of submission generally result in a 30% higher freelancer retention rate.</p>
        </div>
      </div>
    </div>

    <div class="card table-card">
      <div class="table-header">
        <h3 class="table-title">Recently Completed</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Project Details</th>
            <th>Freelancer</th>
            <th>Completed Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!recentlyCompleted.length">
            <td colspan="4" class="empty-row">No completed projects yet.</td>
          </tr>
          <tr v-else v-for="(p, i) in recentlyCompleted" :key="i">
            <td><div class="project-title">{{ p.title }}</div></td>
            <td class="muted">{{ p.freelancer }}</td>
            <td class="date-cell muted">{{ p.completedDate }}</td>
            <td>
              <span class="status-badge completed-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Completed
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.overview { display: flex; flex-direction: column; gap: 1.25rem; }
.overview-header { display: flex; justify-content: space-between; align-items: flex-start; }
.overview-title { margin: 0; font-size: 1.75rem; font-weight: 800; color: #0f172a; }
.overview-sub { margin: 0.2rem 0 0; font-size: 0.875rem; }
.export-btn { display: flex; align-items: center; gap: 0.5rem; border: 1px solid var(--color-primary); background: #fff; color: var(--color-primary); border-radius: 8px; padding: 0.55rem 1rem; font-size: 0.875rem; font-weight: 600; cursor: pointer; }
.export-btn:hover { background: #f0f4ff; }
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.stat-card { padding: 1.25rem 1.5rem; display: flex; justify-content: space-between; align-items: flex-start; }
.stat-body { display: flex; flex-direction: column; gap: 0.35rem; }
.stat-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; color: #94a3b8; }
.stat-value { font-size: 2.75rem; font-weight: 800; color: #0f172a; line-height: 1; }
.stat-sub { font-size: 0.8rem; font-weight: 500; }
.stat-icon-wrap { color: #94a3b8; }
.main-grid { display: grid; grid-template-columns: 1fr 280px; gap: 1rem; align-items: start; }
.tip-card { padding: 1.25rem; display: flex; gap: 0.85rem; align-items: flex-start; }
.tip-icon { width: 36px; height: 36px; border-radius: 50%; background: #eef2ff; color: var(--color-primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.tip-title { font-weight: 700; font-size: 0.875rem; color: #0f172a; margin: 0 0 0.4rem; }
.tip-text { font-size: 0.8rem; margin: 0; line-height: 1.55; }
.tip-body { display: flex; flex-direction: column; }
.table-card { padding: 0; overflow: hidden; }
.table-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; border-bottom: 1px solid #e5e9f2; }
.table-title { margin: 0; font-size: 1rem; font-weight: 700; color: #0f172a; }
.view-all { font-size: 0.8rem; color: var(--color-primary); font-weight: 600; text-decoration: none; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.data-table th { text-align: left; padding: 0.65rem 1.25rem; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; font-weight: 700; border-bottom: 1px solid #e5e9f2; }
.data-table td { padding: 0.85rem 1.25rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.data-table tbody tr:last-child td { border-bottom: none; }
.empty-row { padding: 1.5rem 1.25rem; color: #64748b; font-size: 0.875rem; text-align: center; }
.project-title { font-weight: 600; color: #0f172a; font-size: 0.875rem; }
.project-sub { font-size: 0.775rem; margin-top: 2px; }
.freelancer-cell { display: flex; align-items: center; gap: 0.5rem; }
.f-avatar { width: 28px; height: 28px; border-radius: 50%; background: #e5e9f2; color: #64748b; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; flex-shrink: 0; }
.date-cell { font-size: 0.825rem; white-space: nowrap; }
.status-badge { display: inline-flex; align-items: center; gap: 0.35rem; border-radius: 999px; padding: 0.3rem 0.75rem; font-size: 0.775rem; font-weight: 600; }
.status-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.completed-badge { background: #f0fdf4; color: #16a34a; }
.action-link { color: var(--color-primary); font-weight: 600; text-decoration: none; font-size: 0.825rem; }
@media (max-width: 900px) { .stats-grid { grid-template-columns: 1fr; } .main-grid { grid-template-columns: 1fr; } }
</style>
