import { engagementApi } from './engagementApi'

export const pullsApi = {
  createRequest: engagementApi.createProjectRequest,
  getIncomingRequests: engagementApi.getIncomingRequests,
  getOutgoingRequests: engagementApi.getOutgoingRequests,
  decideRequest: engagementApi.decideRequest,
  getProjects: engagementApi.getProjects,
  getProjectById: engagementApi.getProjectById,
  updateProjectStatus: engagementApi.updateProjectStatus,
  getProjectReviews: engagementApi.getProjectReviews,
  createProjectReview: engagementApi.createProjectReview,
  suggestPrice: engagementApi.suggestPrice
}
