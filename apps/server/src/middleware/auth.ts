import { Request, Response, NextFunction } from 'express'
import { getUserFromToken, hasMinRole } from '@repo/auth'
import type { Role } from '@repo/auth'

export interface AuthUser {
  id: string
  email: string
  role: string
  name: string
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

export const requireAuth = (minRole: Role = 'User') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = getUserFromToken(req.headers.authorization)
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }
    if (!hasMinRole(user.role, minRole)) {
      res.status(403).json({ error: 'Forbidden' })
      return
    }
    req.user = user as AuthUser
    next()
  }
}
