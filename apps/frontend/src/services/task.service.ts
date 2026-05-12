import { apiRequest } from './http-client'
import {
  BulkCreateTaskRequest,
  BulkCreateTaskResponse,
  CreateTaskRequest,
  Task,
  UpdateTaskRequest,
} from '@/types/task'
import { BooleanSuccessResponse } from '@/types/auth'

export const taskService = {
  getMany(listId: string): Promise<Task[]> {
    return apiRequest<Task[]>(`/lists/${listId}/tasks`, {
      method: 'GET',
    })
  },

  create(listId: string, data: CreateTaskRequest): Promise<Task> {
    return apiRequest<Task>(`/lists/${listId}/tasks`, {
      method: 'POST',
      body: data,
    })
  },

  bulkCreate(listId: string, data: BulkCreateTaskRequest): Promise<BulkCreateTaskResponse> {
    return apiRequest<BulkCreateTaskResponse>(`/lists/${listId}/tasks/bulk`, {
      method: 'POST',
      body: data,
    })
  },

  update(listId: string, taskId: string, data: UpdateTaskRequest): Promise<Task> {
    return apiRequest<Task>(`/lists/${listId}/tasks/${taskId}`, {
      method: 'PATCH',
      body: data,
    })
  },

  delete(listId: string, taskId: string): Promise<BooleanSuccessResponse> {
    return apiRequest<BooleanSuccessResponse>(`/lists/${listId}/tasks/${taskId}`, {
      method: 'DELETE',
    })
  },
}
