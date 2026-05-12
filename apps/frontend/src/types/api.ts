export type ApiSuccessResponse<T> = {
  status: 'success'
  message: string
  data: T
}

export type ApiErrorResponse = {
  status: 'error'
  message: string
  data: null
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

export class ApiError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
