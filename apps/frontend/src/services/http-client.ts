import { ApiError, ApiResponse } from '@/types/api'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  skipAuthRefresh?: boolean
}

function buildUrl(path: string): string {
  if (path.startsWith('http')) return path

  return `${API_URL}${path}`
}

function buildHeaders(options: RequestOptions): Headers {
  const headers = new Headers(options.headers)

  if (options.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  return headers
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null

  if (!response.ok) {
    throw new ApiError(payload?.message ?? 'Unexpected API error', response.status)
  }

  if (!payload || payload.status !== 'success') {
    throw new ApiError('Invalid API response', response.status)
  }

  return payload.data
}

async function refreshSession(): Promise<void> {
  const response = await fetch(buildUrl('/auth/refresh'), {
    method: 'POST',
    credentials: 'include',
  })

  await parseResponse<unknown>(response)
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, skipAuthRefresh, ...requestInit } = options
  const response = await fetch(buildUrl(path), {
    ...requestInit,
    credentials: 'include',
    headers: buildHeaders(options),
    ...(body !== undefined && { body: JSON.stringify(body) }),
  })

  if (response.status === 401 && !skipAuthRefresh) {
    await refreshSession()

    return apiRequest<T>(path, {
      ...options,
      skipAuthRefresh: true,
    })
  }

  return parseResponse<T>(response)
}
