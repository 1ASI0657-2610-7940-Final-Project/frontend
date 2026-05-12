import { defineStore } from 'pinia'
import { ref } from 'vue'
import { marketplaceApi } from '@marketplace/api/marketplaceApi'
import type {
  Category,
  CreateServicePayload,
  MyServiceItem,
  ServiceDetail,
  ServiceFilters,
  ServicesListItem,
  UpdateServicePayload
} from '@marketplace/types/marketplace.types'
import { normalizeError } from '@shared/utils/errorMapper'

export const useMarketplaceStore = defineStore('marketplace', () => {
  const services = ref<ServicesListItem[]>([])
  const selectedService = ref<ServiceDetail | null>(null)
  const myServices = ref<MyServiceItem[]>([])
  const categories = ref<Category[]>([])
  const filters = ref<ServiceFilters>({ q: '', page: 1, pageSize: 9 })
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({ total: 0, page: 1, pageSize: 9 })

  const fetchServices = async (nextFilters: ServiceFilters = {}) => {
    loading.value = true
    error.value = null
    try {
      filters.value = { ...filters.value, ...nextFilters }
      const response = await marketplaceApi.getServices(filters.value)
      services.value = response.data
      pagination.value = { total: response.total, page: response.page, pageSize: response.pageSize }
    } catch (e) {
      error.value = normalizeError(e).message
    } finally {
      loading.value = false
    }
  }

  const fetchServiceById = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      selectedService.value = await marketplaceApi.getServiceById(id)
    } catch (e) {
      error.value = normalizeError(e).message
      selectedService.value = null
    } finally {
      loading.value = false
    }
  }

  const fetchMyServices = async () => {
    loading.value = true
    error.value = null
    try {
      myServices.value = await marketplaceApi.getMyServices()
    } catch (e) {
      error.value = normalizeError(e).message
    } finally {
      loading.value = false
    }
  }

  const fetchCategories = async () => {
    try {
      categories.value = await marketplaceApi.getCategories()
    } catch (e) {
      error.value = normalizeError(e).message
    }
  }

  const createService = async (payload: CreateServicePayload) => marketplaceApi.createService(payload)
  const updateService = async (id: string, payload: UpdateServicePayload) => marketplaceApi.updateService(id, payload)
  const deleteService = async (id: string) => marketplaceApi.deleteService(id)
  const uploadServiceMedia = async (id: string, formData: FormData) => marketplaceApi.uploadServiceMedia(id, formData)
  const deleteServiceMedia = async (id: string, mediaId: string) => marketplaceApi.deleteServiceMedia(id, mediaId)

  return {
    services,
    selectedService,
    myServices,
    categories,
    filters,
    loading,
    error,
    pagination,
    fetchServices,
    fetchServiceById,
    fetchMyServices,
    fetchCategories,
    createService,
    updateService,
    deleteService,
    uploadServiceMedia,
    deleteServiceMedia
  }
})
