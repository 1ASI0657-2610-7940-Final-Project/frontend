import { apiClients, http } from '@shared/api/httpClient'
import type { LoginPayload, RegisterPayload, SignUpResponse } from '@access/types/access.types'
import type { LoginResponse } from '@shared/types/common.types'

export const accessApi = {
  login: (payload: LoginPayload) => http.post<LoginResponse>(apiClients.access, '/login', payload),
  signUp: (payload: RegisterPayload) => http.post<SignUpResponse>(apiClients.access, '/sign-up', payload),
  me: () => http.get<LoginResponse['user']>(apiClients.access, '/me'),
  getFreelancerProfile: (userId: string) => http.get(apiClients.access, `/freelancers/${userId}/profile`),
  updateMyFreelancerProfile: (payload: unknown) => http.patch(apiClients.access, '/freelancers/me/profile', payload),
  addPortfolioItem: (formData: FormData) => http.upload(apiClients.access, '/freelancers/me/portfolio', formData),
  deletePortfolioItem: (itemId: string) => http.delete(apiClients.access, `/freelancers/me/portfolio/${itemId}`)
}
