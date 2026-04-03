import { Router, Request, Response } from 'express'
import { requireAuth } from '../middleware/auth'
import { getAllUsers, getUserById, updateUser, deleteUser } from '@repo/api'
import { UserUpdateSchema } from '@repo/validation'

const router = Router()

// GET /api/users
router.get('/', requireAuth('Admin'), async (_req: Request, res: Response) => {
  try {
    const users = await getAllUsers()
    res.json({ users })
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/users/:id
router.get('/:id', requireAuth('Admin'), async (req: Request, res: Response) => {
  try {
    const user = await getUserById(req.params.id)
    if (!user) { res.status(404).json({ error: 'Not found' }); return }
    res.json({ user })
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// PATCH /api/users/:id
router.patch('/:id', requireAuth('User'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    if (req.user!.id !== id && req.user!.role !== 'Admin') {
      res.status(403).json({ error: 'Forbidden' })
      return
    }
    const parsed = UserUpdateSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() })
      return
    }
    const data = { ...parsed.data }
    if (req.user!.role !== 'Admin') delete data.role
    const user = await updateUser(id, data)
    res.json({ user })
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE /api/users/:id
router.delete('/:id', requireAuth('Admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    if (id === req.user!.id) {
      res.status(400).json({ error: 'Cannot delete yourself' })
      return
    }
    await deleteUser(id)
    res.json({ message: 'User deleted' })
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
