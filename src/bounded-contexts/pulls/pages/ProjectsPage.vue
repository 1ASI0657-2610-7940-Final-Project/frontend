<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useEngagementStore } from '@pulls/stores/engagementStore'
import ProjectStatusBadge from '../components/ProjectStatusBadge.vue'
import LoadingState from '../../../shared/components/LoadingState.vue'
import EmptyState from '../../../shared/components/EmptyState.vue'
import ErrorState from '../../../shared/components/ErrorState.vue'

const router = useRouter()
const store = useEngagementStore()
const selectedStatus = ref('ALL')

const filtered = computed(() => selectedStatus.value === 'ALL' ? store.projects : store.projects.filter((item) => item.status === selectedStatus.value))

onMounted(async () => { await store.fetchProjects() })
</script>

<template>
  <section class="page">
    <h1 class="page-title">Projects List</h1>
    <p class="muted">Manage and track the status of your active and past engagements.</p>

    <div class="filters">
      <button :class="{ active: selectedStatus === 'ALL' }" @click="selectedStatus = 'ALL'">All</button>
      <button :class="{ active: selectedStatus === 'PENDING' }" @click="selectedStatus = 'PENDING'">Pending</button>
      <button :class="{ active: selectedStatus === 'IN_PROGRESS' }" @click="selectedStatus = 'IN_PROGRESS'">In Progress</button>
      <button :class="{ active: selectedStatus === 'FINISHED' }" @click="selectedStatus = 'FINISHED'">Finished</button>
      <button :class="{ active: selectedStatus === 'CANCELLED' }" @click="selectedStatus = 'CANCELLED'">Cancelled</button>
    </div>

    <ErrorState v-if="store.error" :message="store.error" />
    <LoadingState v-else-if="store.loading" />
    <EmptyState v-else-if="!filtered.length" title="No projects found" message="There are no projects for this filter." />

    <div class="card table-wrap" v-else>
      <table>
        <thead><tr><th>Project</th><th>Client/Freelancer</th><th>Status</th><th>Final Price</th><th>Action</th></tr></thead>
        <tbody>
          <tr v-for="project in filtered" :key="project.id">
            <td>{{ project.id }}</td>
            <td>{{ project.clientId }} / {{ project.freelancerId }}</td>
            <td><ProjectStatusBadge :status="project.status" /></td>
            <td>{{ project.finalPrice }} {{ project.currency }}</td>
            <td><button @click="router.push(`/projects/${project.id}`)">View Detail</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.page { display: grid; gap: 1rem; }
.filters { display: flex; gap: 0.55rem; flex-wrap: wrap; }
.filters button { border: 1px solid var(--color-border); border-radius: 999px; padding: 0.4rem 0.8rem; background: #fff; }
.filters button.active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { text-align: left; padding: 0.8rem; border-bottom: 1px solid var(--color-border); }
td button { border: 1px solid var(--color-primary); color: var(--color-primary); border-radius: 8px; background: #fff; padding: 0.35rem 0.65rem; }
</style>
