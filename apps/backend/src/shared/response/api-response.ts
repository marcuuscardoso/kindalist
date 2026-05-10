export const apiResponse = {
  success: <T>(data: T, message = 'Success') => ({
    status: 'success',
    message,
    data,
  }),
  error: (message: string) => ({
    status: 'error',
    message,
    data: null,
  }),
}
