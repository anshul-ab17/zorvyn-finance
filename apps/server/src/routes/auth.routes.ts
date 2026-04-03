import { Router, Request, Response } from 'express'
import prisma from '@repo/db'
import { hashPassword, comparePassword, generateToken } from '@repo/auth'
import { RegisterSchema, LoginSchema } from '@repo/validation'
import { requireAuth } from '../middleware/auth'

const router = Router()

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const parsed = RegisterSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() })
      return
    }
    const { name, email, password, role } = parsed.data
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      res.status(409).json({ error: 'Email already registered' })
      return
    }
    const hashed = await hashPassword(password)
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role },
      select: { id: true, name: true, email: true, role: true },
    })
    const token = generateToken({ id: user.id, email: user.email, role: user.role, name: user.name })
    res.status(201).json({ user, token })
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const parsed = LoginSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() })
      return
    }
    const { email, password } = parsed.data
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }
    const valid = await comparePassword(password, user.password)
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }
    const token = generateToken({ id: user.id, email: user.email, role: user.role, name: user.name })
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token })
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/auth/me
router.get('/me', requireAuth(), async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, name: true, email: true, role: true, monthlyLimit: true, createdAt: true },
    })
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }
    res.json({ user })
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
