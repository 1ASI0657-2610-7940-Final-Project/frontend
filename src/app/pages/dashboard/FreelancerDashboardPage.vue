<script setup lang="ts">
const stats = [
  {
    label: 'PENDING REQUESTS',
    value: '12',
    sub: '↑ 3 since last week',
    subColor: '#22c55e',
    icon: 'hourglass',
  },
  {
    label: 'ACTIVE PROJECTS',
    value: '5',
    sub: 'All tracking on schedule',
    subColor: '#64748b',
    icon: 'team',
  },
  {
    label: 'COMPLETED (MTD)',
    value: '8',
    sub: '↑ 12% volume increase',
    subColor: '#22c55e',
    icon: 'check',
  },
]

const activeProjects = [
  { title: 'UI Design System Update', subtitle: 'Milestone 2 Delivery', initials: 'AR', freelancer: 'Alex Rivera', dueDate: 'Oct 24, 2023', status: 'In Progress', statusColor: '#3b5bdb', statusBg: '#eef2ff' },
  { title: 'Backend API Integration', subtitle: 'Stripe Webhooks', initials: 'SJ', freelancer: 'Sarah Jenkins', dueDate: 'Oct 26, 2023', status: 'In Review', statusColor: '#6366f1', statusBg: '#eef2ff' },
]

const recentlyCompleted = [
  { title: 'Marketing Copywriting', subtitle: '', freelancer: 'David Kim', completedDate: 'Oct 18, 2023' },
  { title: 'Logo Redesign Concept', subtitle: '', freelancer: 'Elena Rossi', completedDate: 'Oct 15, 2023' },
]
</script>

<template>
  <div class="overview">
    <!-- Header -->
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

    <!-- Stat cards -->
    <div class="stats-grid">
      <div v-for="stat in stats" :key="stat.label" class="stat-card card">
        <div class="stat-body">
          <span class="stat-label">{{ stat.label }}</span>
          <span class="stat-value">{{ stat.value }}</span>
          <span class="stat-sub" :style="{ color: stat.subColor }">{{ stat.sub }}</span>
        </div>
        <div class="stat-icon-wrap">
          <!-- Hourglass -->
          <svg v-if="stat.icon === 'hourglass'" xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.18"><path d="M5 22h14M5 2h14M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>
          <!-- Team -->
          <svg v-else-if="stat.icon === 'team'" xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.18"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <!-- Check circle -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.18"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
      </div>
    </div>

    <!-- Active projects + tip -->
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
            <tr v-for="p in activeProjects" :key="p.title">
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

      <!-- Tip card -->
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

    <!-- Recently completed -->
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
          <tr v-for="p in recentlyCompleted" :key="p.title">
            <td>
              <div class="project-title">{{ p.title }}</div>
            </td>
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

/* Header */
.overview-header { display: flex; justify-content: space-between; align-items: flex-start; }
.overview-title { margin: 0; font-size: 1.75rem; font-weight: 800; color: #0f172a; }
.overview-sub { margin: 0.2rem 0 0; font-size: 0.875rem; }
.export-btn { display: flex; align-items: center; gap: 0.5rem; border: 1px solid var(--color-primary); background: #fff; color: var(--color-primary); border-radius: 8px; padding: 0.55rem 1rem; font-size: 0.875rem; font-weight: 600; cursor: pointer; white-space: nowrap; }
.export-btn:hover { background: #f0f4ff; }

/* Stat cards */
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.stat-card { padding: 1.25rem 1.5rem; display: flex; justify-content: space-between; align-items: flex-start; overflow: hidden; position: relative; }
.stat-body { display: flex; flex-direction: column; gap: 0.35rem; }
.stat-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; color: #94a3b8; }
.stat-value { font-size: 2.75rem; font-weight: 800; color: #0f172a; line-height: 1; }
.stat-sub { font-size: 0.8rem; font-weight: 500; }
.stat-icon-wrap { display: flex; align-items: center; color: #94a3b8; }

/* Main grid */
.main-grid { display: grid; grid-template-columns: 1fr 280px; gap: 1rem; align-items: start; }

/* Tip card */
.tip-card { padding: 1.25rem; display: flex; gap: 0.85rem; align-items: flex-start; }
.tip-icon { width: 36px; height: 36px; border-radius: 50%; background: #eef2ff; color: var(--color-primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.tip-title { font-weight: 700; font-size: 0.875rem; color: #0f172a; margin: 0 0 0.4rem; }
.tip-text { font-size: 0.8rem; margin: 0; line-height: 1.55; }
.tip-body { display: flex; flex-direction: column; }

/* Table */
.table-card { padding: 0; overflow: hidden; }
.table-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; border-bottom: 1px solid #e5e9f2; }
.table-title { margin: 0; font-size: 1rem; font-weight: 700; color: #0f172a; }
.view-all { font-size: 0.8rem; color: var(--color-primary); font-weight: 600; text-decoration: none; }
.view-all:hover { text-decoration: underline; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.data-table th { text-align: left; padding: 0.65rem 1.25rem; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; font-weight: 700; border-bottom: 1px solid #e5e9f2; }
.data-table td { padding: 0.85rem 1.25rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.data-table tbody tr:last-child td { border-bottom: none; }
.project-title { font-weight: 600; color: #0f172a; font-size: 0.875rem; }
.project-sub { font-size: 0.775rem; margin-top: 2px; }
.freelancer-cell { display: flex; align-items: center; gap: 0.5rem; }
.f-avatar { width: 28px; height: 28px; border-radius: 50%; background: #e5e9f2; color: #64748b; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; flex-shrink: 0; }
.date-cell { font-size: 0.825rem; white-space: nowrap; }
.status-badge { display: inline-flex; align-items: center; gap: 0.35rem; border-radius: 999px; padding: 0.3rem 0.75rem; font-size: 0.775rem; font-weight: 600; }
.status-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.completed-badge { background: #f0fdf4; color: #16a34a; }
.action-link { color: var(--color-primary); font-weight: 600; text-decoration: none; font-size: 0.825rem; }
.action-link:hover { text-decoration: underline; }

@media (max-width: 900px) { .stats-grid { grid-template-columns: 1fr; } .main-grid { grid-template-columns: 1fr; } }
</style>
