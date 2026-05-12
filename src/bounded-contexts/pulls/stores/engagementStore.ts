import { defineStore } from 'pinia'
import { ref } from 'vue'
import { engagementApi } from '@pulls/api/engagementApi'
import { normalizeError } from '@shared/utils/errorMapper'
import type {
  CreateProjectRequestPayload,
  CreateProjectReviewPayload,
  DecideRequestPayload,
  PriceSuggestionPayload,
  PriceSuggestionResponse,
  Project,
  ProjectRequest,
  ProjectReview,
  UpdateProjectStatusPayload
} from '@pulls/types/engagement.types'

export const useEngagementStore = defineStore('engagement', () => {
  const incomingRequests = ref<ProjectRequest[]>([])
  const outgoingRequests = ref<ProjectRequest[]>([])
  const projects = ref<Project[]>([])
  const selectedProject = ref<Project | null>(null)
  const reviews = ref<ProjectReview[]>([])
  const priceSuggestion = ref<PriceSuggestionResponse | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const wrap = async <T>(action: () => Promise<T>) => {
    loading.value = true
    error.value = null
    try {
      return await action()
    } catch (e) {
      error.value = normalizeError(e).message
      throw e
    } finally {
      loading.value = false
    }
  }

  const createProjectRequest = (payload: CreateProjectRequestPayload) => wrap(() => engagementApi.createProjectRequest(payload))
  const fetchIncomingRequests = () => wrap(async () => (incomingRequests.value = await engagementApi.getIncomingRequests()))
  const fetchOutgoingRequests = () => wrap(async () => (outgoingRequests.value = await engagementApi.getOutgoingRequests()))
  const decideRequest = (id: string, payload: DecideRequestPayload) => wrap(() => engagementApi.decideRequest(id, payload))
  const fetchProjects = () => wrap(async () => (projects.value = await engagementApi.getProjects()))
  const fetchProjectById = (id: string) => wrap(async () => (selectedProject.value = await engagementApi.getProjectById(id)))
  const updateProjectStatus = (id: string, payload: UpdateProjectStatusPayload) => wrap(() => engagementApi.updateProjectStatus(id, payload))
  const fetchProjectReviews = (id: string) => wrap(async () => (reviews.value = await engagementApi.getProjectReviews(id)))
  const createProjectReview = (id: string, payload: CreateProjectReviewPayload) => wrap(() => engagementApi.createProjectReview(id, payload))
  const suggestPrice = (payload: PriceSuggestionPayload) =>
    wrap(async () => (priceSuggestion.value = await engagementApi.suggestPrice(payload)))

  return {
    incomingRequests,
    outgoingRequests,
    projects,
    selectedProject,
    reviews,
    priceSuggestion,
    loading,
    error,
    createProjectRequest,
    fetchIncomingRequests,
    fetchOutgoingRequests,
    decideRequest,
    fetchProjects,
    fetchProjectById,
    updateProjectStatus,
    fetchProjectReviews,
    createProjectReview,
    suggestPrice
  }
})
