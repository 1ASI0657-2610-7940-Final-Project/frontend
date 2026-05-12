import { apiClients, http } from '@shared/api/httpClient'
import type {
  CreateProjectRequestPayload,
  CreateProjectReviewPayload,
  DecideRequestPayload,
  DecideRequestResponse,
  PriceSuggestionPayload,
  PriceSuggestionResponse,
  Project,
  ProjectRequest,
  ProjectReview,
  UpdateProjectStatusPayload,
  UpdateProjectStatusResponse
} from '@pulls/types/engagement.types'

export const engagementApi = {
  createProjectRequest: (payload: CreateProjectRequestPayload) => http.post<ProjectRequest>(apiClients.engagement, '/requests', payload),
  getProjectReviews: (projectId: string) => http.get<ProjectReview[]>(apiClients.engagement, `/projects/${projectId}/reviews`),
  createProjectReview: (projectId: string, payload: CreateProjectReviewPayload) =>
    http.post<ProjectReview>(apiClients.engagement, `/projects/${projectId}/reviews`, payload),
  suggestPrice: (payload: PriceSuggestionPayload) =>
    http.post<PriceSuggestionResponse>(apiClients.engagement, '/price-suggestions', payload),
  decideRequest: (id: string, payload: DecideRequestPayload) =>
    http.patch<DecideRequestResponse>(apiClients.engagement, `/requests/${id}/decision`, payload),
  updateProjectStatus: (projectId: string, payload: UpdateProjectStatusPayload) =>
    http.patch<UpdateProjectStatusResponse>(apiClients.engagement, `/projects/${projectId}/status`, payload),
  getOutgoingRequests: () => http.get<ProjectRequest[]>(apiClients.engagement, '/requests/outgoing'),
  getIncomingRequests: () => http.get<ProjectRequest[]>(apiClients.engagement, '/requests/incoming'),
  getProjects: () => http.get<Project[]>(apiClients.engagement, '/projects'),
  getProjectById: (id: string) => http.get<Project>(apiClients.engagement, `/projects/${id}`)
}
