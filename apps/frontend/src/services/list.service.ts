import { apiRequest } from './http-client'
import { ArchiveListRequest, CreateListRequest, List, UpdateListRequest } from '@/types/list'
import { BooleanSuccessResponse } from '@/types/auth'

export const listService = {
  getMany(archived = false): Promise<List[]> {
    const params = new URLSearchParams({ archived: String(archived) })

    return apiRequest<List[]>(`/lists?${params.toString()}`, {
      method: 'GET',
    })
  },

  create(data: CreateListRequest): Promise<List> {
    return apiRequest<List>('/lists', {
      method: 'POST',
      body: data,
    })
  },

  update(listId: string, data: UpdateListRequest): Promise<List> {
    return apiRequest<List>(`/lists/${listId}`, {
      method: 'PATCH',
      body: data,
    })
  },

  archive(listId: string, data: ArchiveListRequest): Promise<List> {
    return apiRequest<List>(`/lists/${listId}/archive`, {
      method: 'PATCH',
      body: data,
    })
  },

  delete(listId: string): Promise<BooleanSuccessResponse> {
    return apiRequest<BooleanSuccessResponse>(`/lists/${listId}`, {
      method: 'DELETE',
    })
  },
}
