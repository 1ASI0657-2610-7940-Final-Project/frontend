export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'
export type ProjectStatus = 'PENDING' | 'IN_PROGRESS' | 'DELIVERED' | 'FINISHED' | 'CANCELLED'

export interface CreateProjectRequestPayload {
  serviceId: string
  freelancerId: string
  message: string
  proposedPrice: number
  currency: string
  proposedDeliveryDays: number
}

export interface ProjectRequest {
  id: string
  serviceId: string
  clientId?: string
  freelancerId: string
  proposedPrice: number
  currency: string
  proposedDeliveryDays?: number
  message?: string
  status: RequestStatus
  createdAt: string
}

export interface DecideRequestPayload {
  decision: 'ACCEPTED' | 'REJECTED'
  finalPrice?: number
  finalDeliveryDays?: number
  responseMessage: string
}

export interface DecideRequestResponse {
  requestId: string
  status: RequestStatus
  agreement?: {
    id: string
    finalPrice: number
    currency: string
    finalDeliveryDays: number
  }
  project?: {
    id: string
    status: ProjectStatus
  }
}

export interface ProjectStatusHistoryItem {
  status: ProjectStatus
  changedAt: string
}

export interface Project {
  id: string
  requestId?: string
  agreementId?: string
  serviceId: string
  clientId: string
  freelancerId: string
  status: ProjectStatus
  finalPrice: number
  currency: string
  statusHistory?: ProjectStatusHistoryItem[]
}

export interface UpdateProjectStatusPayload {
  status: ProjectStatus
  comment?: string
}

export interface UpdateProjectStatusResponse {
  projectId: string
  previousStatus: ProjectStatus
  currentStatus: ProjectStatus
  changedAt: string
}

export interface ProjectReview {
  id: string
  projectId: string
  reviewerId: string
  revieweeId: string
  rating: number
  comment: string
  createdAt: string
}

export interface CreateProjectReviewPayload {
  revieweeId: string
  rating: number
  comment: string
}

export interface PriceSuggestionPayload {
  serviceType: string
  complexity: 'LOW' | 'MEDIUM' | 'HIGH'
  urgency: 'NORMAL' | 'URGENT'
  freelancerExperience: 'JUNIOR' | 'INTERMEDIATE' | 'SENIOR'
}

export interface PriceSuggestionResponse {
  suggestedMinPrice: number
  suggestedMaxPrice: number
  currency: string
  criteria: PriceSuggestionPayload
}
