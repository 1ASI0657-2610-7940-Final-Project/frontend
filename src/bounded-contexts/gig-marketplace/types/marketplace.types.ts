export interface ServiceFilters {
  q?: string
  category?: string
  priceMin?: number
  priceMax?: number
  minRating?: number
  page?: number
  pageSize?: number
}

export interface ServicesListItem {
  id: string
  title: string
  descriptionPreview: string
  basePrice: number
  currency: string
  category: string
  freelancerId: string
  freelancerDisplayName: string
  averageRating?: number | null
  thumbnailUrl?: string
}

export interface ServicesListResponse {
  data: ServicesListItem[]
  total: number
  page: number
  pageSize: number
}

export interface Category {
  id: string
  name: string
}

export interface ServiceMedia {
  id: string
  serviceId?: string
  url: string
  type: 'IMAGE' | 'VIDEO' | string
  primary: boolean
  bucket?: string
  objectPath?: string
  contentType?: string
  sizeBytes?: number
  sortOrder?: number
  createdAt?: string
}

export interface ServiceDetail {
  id: string
  title: string
  description: string
  basePrice: number
  currency: string
  deliveryDays: number
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | string
  category: Category
  tags: string[]
  freelancer: {
    id: string
    displayName: string
    averageRating?: number | null
    reviewsCount?: number
  }
  media: ServiceMedia[]
  thumbnailUrl?: string
}

export interface MyServiceItem {
  id: string
  title: string
  basePrice: number
  currency: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | string
  thumbnailUrl?: string
}

export interface CreateServicePayload {
  title: string
  description: string
  basePrice: number
  currency: string
  categoryId: string
  deliveryDays: number
  tags: string[]
}

export interface CreateServiceResponse {
  id: string
  title: string
  status: string
  createdAt: string
}

export interface UpdateServicePayload {
  title?: string
  description?: string
  basePrice?: number
  currency?: string
  categoryId?: string
  deliveryDays?: number
  tags?: string[]
  status?: string
}

export interface UpdateServiceResponse {
  id: string
  updated: boolean
  updatedAt: string
}

export interface UploadServiceMediaResponse {
  id: string
  serviceId: string
  url: string
  type: 'IMAGE' | 'VIDEO' | string
  primary: boolean
}
