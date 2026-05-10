export type RegisterOutput = {
  user: {
    id: string
    name: string
    email: string
  }
  accessToken: string
  refreshToken: string
}
