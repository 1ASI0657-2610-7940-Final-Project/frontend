<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../../app/stores/authStore'
import { useEngagementStore } from '@pulls/stores/engagementStore'
import ProjectStatusBadge from '../components/ProjectStatusBadge.vue'
import ProjectTimeline from '../components/ProjectTimeline.vue'
import StatusUpdateModal from '../components/StatusUpdateModal.vue'
import ReviewForm from '../components/ReviewForm.vue'
import ReviewList from '../components/ReviewList.vue'
import LoadingState from '../../../shared/components/LoadingState.vue'
import ErrorState from '../../../shared/components/ErrorState.vue'
import type { ProjectStatus, UpdateProjectStatusPayload } from '@pulls/types/engagement.types'
import ReportUserModal from '@chat/components/ReportUserModal.vue'
import { chatApi } from '@chat/api/chatApi'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const store = useEngagementStore()
const openStatusModal = ref(false)
const openReportModal = ref(false)

const projectId = computed(() => route.params.id as string)
const project = computed(() => store.selectedProject)

const transitions: Record<ProjectStatus, ProjectStatus[]> = {
  PENDING: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['DELIVERED', 'CANCELLED'],
  DELIVERED: ['FINISHED'],
  FINISHED: [],
  CANCELLED: []
}

const nextStatuses = computed(() => {
  if (!project.value) return []
  return transitions[project.value.status] || []
})

const revieweeId = computed(() => {
  if (!project.value || !auth.user) return ''
  return auth.user.role === 'CLIENT' ? project.value.freelancerId : project.value.clientId
})

const load = async () => {
  await Promise.all([store.fetchProjectById(projectId.value), store.fetchProjectReviews(projectId.value)])
}

const updateStatus = async (payload: UpdateProjectStatusPayload) => {
  await store.updateProjectStatus(projectId.value, payload)
  openStatusModal.value = false
  await load()
}

const submitReview = async (payload: { revieweeId: string; rating: number; comment: string }) => {
  await store.createProjectReview(projectId.value, payload)
  await store.fetchProjectReviews(projectId.value)
}

const openChat = async () => {
  if (!project.value || !revieweeId.value) return
  const created = await chatApi.createConversation({
    participantId: revieweeId.value,
    projectId: project.value.id
  })
  await router.push(`/chat?conversationId=${created.id}`)
}

onMounted(load)
</script>

<template>
  <section class="page">
    <ErrorState v-if="store.error" :message="store.error" />
    <LoadingState v-else-if="store.loading" />

    <template v-else-if="project">
      <header class="head card">
        <div>
          <p class="muted">Projects / {{ project.id }}</p>
          <h1>{{ project.id }}</h1>
          <ProjectStatusBadge :status="project.status" />
        </div>
        <div class="head-actions">
          <button @click="openChat">Open Chat</button>
          <button v-if="nextStatuses.length" @click="openStatusModal = true">Update Status</button>
          <button @click="openReportModal = true">Report User</button>
        </div>
      </header>

      <div class="grid">
        <section class="card panel">
          <h3>Project Brief</h3>
          <p class="muted">Service ID: {{ project.serviceId }}</p>
          <p><strong>Final Price:</strong> {{ project.finalPrice }} {{ project.currency }}</p>
          <p><strong>Client:</strong> {{ project.clientId }}</p>
          <p><strong>Freelancer:</strong> {{ project.freelancerId }}</p>
        </section>

        <ProjectTimeline :history="project.statusHistory || []" />
      </div>

      <ReviewList :reviews="store.reviews" />
      <ReviewForm v-if="project.status === 'FINISHED' && revieweeId" :reviewee-id="revieweeId" @submit="submitReview" />
    </template>

    <StatusUpdateModal :open="openStatusModal" :options="nextStatuses" @close="openStatusModal = false" @submit="updateStatus" />
    <ReportUserModal :open="openReportModal" :reported-user-id="revieweeId" @close="openReportModal = false" />
  </section>
</template>

<style scoped>
.page { display: grid; gap: 1rem; }
.head { padding: 1rem; display: flex; justify-content: space-between; align-items: flex-start; }
.head-actions { display: flex; gap: 0.5rem; }
.head button { border: none; background: var(--color-primary); color: #fff; border-radius: 8px; padding: 0.55rem 0.85rem; font-weight: 700; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.panel { padding: 1rem; }
@media (max-width: 960px) { .grid { grid-template-columns: 1fr; } }
</style>
