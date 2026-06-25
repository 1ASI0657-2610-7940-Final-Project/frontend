import { apiClients, http } from '@shared/api/httpClient'
import type {
  CreateServicePayload,
  CreateServiceResponse,
  MyServiceItem,
  ServiceDetail,
  ServiceFilters,
  ServicesListResponse,
  UpdateServicePayload,
  UpdateServiceResponse,
  UploadServiceMediaResponse,
  Category
} from '@marketplace/types/marketplace.types'

const pickRating = (source: Record<string, unknown>): number | null => {
  const candidates = ['averageRating', 'rating', 'avgRating']
  for (const key of candidates) {
    const value = source[key]
    if (typeof value === 'number' && Number.isFinite(value)) return value
  }
  return null
}

const normalizeListItem = (item: Record<string, unknown>): ServicesListResponse['data'][number] => ({
  id: String(item.id ?? ''),
  title: String(item.title ?? ''),
  descriptionPreview: String(item.descriptionPreview ?? ''),
  basePrice: Number(item.basePrice ?? 0),
  currency: String(item.currency ?? 'USD'),
  category: String(item.category ?? 'General'),
  freelancerId: String(item.freelancerId ?? ''),
  freelancerDisplayName: String(item.freelancerDisplayName ?? 'Freelancer'),
  averageRating: pickRating(item),
  thumbnailUrl: typeof item.thumbnailUrl === 'string' ? item.thumbnailUrl : ''
})

const normalizeDetail = (service: Record<string, unknown>): ServiceDetail => {
  const freelancer = (service.freelancer ?? {}) as Record<string, unknown>
  const media = Array.isArray(service.media)
    ? service.media.map((item) => {
        const source = item as Record<string, unknown>
        return {
          id: String(source.id ?? ''),
          serviceId: String(source.serviceId ?? ''),
          url: String(source.url ?? ''),
          type: String(source.type ?? 'IMAGE'),
          primary: Boolean(source.primary ?? false),
          bucket: typeof source.bucket === 'string' ? source.bucket : undefined,
          objectPath: typeof source.objectPath === 'string' ? source.objectPath : undefined,
          contentType: typeof source.contentType === 'string' ? source.contentType : undefined,
          sizeBytes: typeof source.sizeBytes === 'number' ? source.sizeBytes : undefined,
          sortOrder: typeof source.sortOrder === 'number' ? source.sortOrder : undefined,
          createdAt: typeof source.createdAt === 'string' ? source.createdAt : undefined
        }
      })
    : []
  return {
    ...(service as unknown as ServiceDetail),
    media,
    thumbnailUrl:
      typeof service.thumbnailUrl === 'string'
        ? service.thumbnailUrl
        : media.find((item) => item.primary)?.url ?? media[0]?.url ?? '',
    freelancer: {
      id: String(freelancer.id ?? ''),
      displayName: String(freelancer.displayName ?? 'Freelancer'),
      averageRating: pickRating(freelancer),
      reviewsCount: typeof freelancer.reviewsCount === 'number' ? freelancer.reviewsCount : 0
    }
  }
}

export const marketplaceApi = {
  getServices: async (filters: ServiceFilters = {}) => {
    const response = await http.get<ServicesListResponse>(apiClients.marketplace, '/services', { params: filters })
    return {
      ...response,
      data: Array.isArray(response.data) ? response.data.map((item: unknown) => normalizeListItem(item as Record<string, unknown>)) : []
    }
  },
  getServiceById: async (id: string) => {
    const response = await http.get<ServiceDetail>(apiClients.marketplace, `/services/${id}`)
    return normalizeDetail(response as unknown as Record<string, unknown>)
  },
  createService: (payload: CreateServicePayload) => http.post<CreateServiceResponse>(apiClients.marketplace, '/services', payload),
  uploadServiceMedia: (id: string, formData: FormData) =>
    http.upload<UploadServiceMediaResponse>(apiClients.marketplace, `/services/${id}/media`, formData),
  updateService: (id: string, payload: UpdateServicePayload) =>
    http.patch<UpdateServiceResponse>(apiClients.marketplace, `/services/${id}`, payload),
  deleteService: (id: string) => http.delete<void>(apiClients.marketplace, `/services/${id}`),
  getMyServices: () => http.get<MyServiceItem[]>(apiClients.marketplace, '/services/mine'),
  getCategories: () => http.get<Category[]>(apiClients.marketplace, '/categories'),
  deleteServiceMedia: (id: string, mediaId: string) => http.delete<void>(apiClients.marketplace, `/services/${id}/media/${mediaId}`)
}
