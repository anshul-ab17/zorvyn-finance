import { Router, Request, Response } from 'express'
import { requireAuth } from '../middleware/auth'
import { createRecord, getRecords, getRecordById, updateRecord, deleteRecord } from '@repo/api'
import { RecordCreateSchema, RecordFilterSchema, RecordUpdateSchema } from '@repo/validation'
import { cacheGet, cacheSet, invalidatePattern } from '@repo/cache'

const router = Router()

// GET /api/records
router.get('/', requireAuth(), async (req: Request, res: Response) => {
  try {
    const parsed = RecordFilterSchema.safeParse(req.query)
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() })
      return
    }
    const cacheKey = `records:${req.user!.id}:${JSON.stringify(parsed.data)}`
    const cached = await cacheGet(cacheKey)
    if (cached) { res.json(cached); return }
    const result = await getRecords(req.user!.id, req.user!.role, parsed.data)
    await cacheSet(cacheKey, result, 60)
    res.json(result)
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/records
router.post('/', requireAuth('User'), async (req: Request, res: Response) => {
  try {
    const parsed = RecordCreateSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() })
      return
    }
    const record = await createRecord(req.user!.id, parsed.data)
    await invalidatePattern(`records:${req.user!.id}:*`)
    await invalidatePattern(`dashboard:${req.user!.id}:*`)
    res.status(201).json({ record })
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/records/:id
router.get('/:id', requireAuth(), async (req: Request, res: Response) => {
  try {
    const record = await getRecordById(req.params.id, req.user!.id, req.user!.role)
    if (!record) { res.status(404).json({ error: 'Not found' }); return }
    res.json({ record })
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// PATCH /api/records/:id
router.patch('/:id', requireAuth('User'), async (req: Request, res: Response) => {
  try {
    const parsed = RecordUpdateSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() })
      return
    }
    const record = await updateRecord(req.params.id, req.user!.id, req.user!.role, parsed.data)
    if (!record) { res.status(404).json({ error: 'Not found or forbidden' }); return }
    await invalidatePattern(`records:${req.user!.id}:*`)
    await invalidatePattern(`dashboard:${req.user!.id}:*`)
    res.json({ record })
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE /api/records/:id
router.delete('/:id', requireAuth('User'), async (req: Request, res: Response) => {
  try {
    const record = await deleteRecord(req.params.id, req.user!.id, req.user!.role)
    if (!record) { res.status(404).json({ error: 'Not found or forbidden' }); return }
    await invalidatePattern(`records:${req.user!.id}:*`)
    await invalidatePattern(`dashboard:${req.user!.id}:*`)
    res.json({ message: 'Record deleted' })
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
