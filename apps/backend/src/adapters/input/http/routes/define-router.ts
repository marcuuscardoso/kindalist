import { NextFunction, Request, RequestHandler, Response, Router } from 'express'
import { Role as UserRole } from '@/core/domain/enums/user-role.enum'
import { errorMiddleware } from '../error-handler'
import { authenticationMiddleware } from '../middlewares/auth.middleware'

export enum ERouterMethod {
  GET,
  POST,
  PATCH,
  DELETE,
}

/**
 * PUBLIC: The endpoint is public and can be accessed without authentication.
 * OPEN: The endpoint needs authentication, but doesn't require roles.
 * PRIVATE: The endpoint needs authentication and requires a role.
 */
export enum EAuthMethod {
  PUBLIC,
  OPEN,
  PRIVATE,
}

type BaseRouteDefinition = {
  method: ERouterMethod
  url: string
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown> | void
}

type PublicRouteDefinition = BaseRouteDefinition & {
  authMethod: EAuthMethod.PUBLIC
  roles?: never
}

type OpenRouteDefinition = BaseRouteDefinition & {
  authMethod: EAuthMethod.OPEN
  roles?: never
}

type PrivateRouteDefinition = BaseRouteDefinition & {
  authMethod: EAuthMethod.PRIVATE
  roles: UserRole[]
}

export type RouteDefinition = PublicRouteDefinition | OpenRouteDefinition | PrivateRouteDefinition

const methodMap: Record<ERouterMethod, 'get' | 'post' | 'patch' | 'delete'> = {
  [ERouterMethod.GET]: 'get',
  [ERouterMethod.POST]: 'post',
  [ERouterMethod.PATCH]: 'patch',
  [ERouterMethod.DELETE]: 'delete',
}

const setAuth = (authMethod: EAuthMethod, roles?: UserRole[]): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.auth = {
      method: authMethod,
      ...(roles !== undefined && { roles }),
    }
    next()
  }
}

export function defineRouter(routes: RouteDefinition[]): Router {
  const router = Router({ mergeParams: true })

  for (const route of routes) {
    const isPublic = route.authMethod === EAuthMethod.PUBLIC
    const authMiddlewares = isPublic ? [] : [errorMiddleware(authenticationMiddleware)]

    router[methodMap[route.method]](
      route.url,
      setAuth(route.authMethod, route.roles),
      ...authMiddlewares,
      errorMiddleware(route.handler),
    )
  }

  return router
}
