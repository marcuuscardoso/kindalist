import { Response } from 'express'

const ACCESS_TOKEN_COOKIE_MAX_AGE_IN_MS = 15 * 60 * 1000
const REFRESH_COOKIE_MAX_AGE_IN_MS = 7 * 24 * 60 * 60 * 1000

const baseAuthCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
}

const accessTokenCookieOptions = {
  ...baseAuthCookieOptions,
  maxAge: ACCESS_TOKEN_COOKIE_MAX_AGE_IN_MS,
}

const refreshCookieOptions = {
  ...baseAuthCookieOptions,
  maxAge: REFRESH_COOKIE_MAX_AGE_IN_MS,
}

type SetAuthCookiesInput = {
  accessToken: string
  refreshToken: string
  sessionId: string
}

export const authCookies = {
  set(res: Response, input: SetAuthCookiesInput): Response {
    return res
      .cookie('access_token', input.accessToken, accessTokenCookieOptions)
      .cookie('refresh_token', input.refreshToken, refreshCookieOptions)
      .cookie('session_id', input.sessionId, refreshCookieOptions)
  },

  clear(res: Response): Response {
    return res
      .clearCookie('access_token', baseAuthCookieOptions)
      .clearCookie('refresh_token', baseAuthCookieOptions)
      .clearCookie('session_id', baseAuthCookieOptions)
  },
}
