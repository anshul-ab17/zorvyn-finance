import { Router, Request, Response } from 'express'
import { requireAuth } from '../middleware/auth'
import { getSummary, getCategoryWise, getTrends, getRecent, getInsights } from '@repo/api'
import { cacheGet, cacheSet } from '@repo/cache'

const router = Router()

// GET /api/dashboard/summary
router.get('/summary', requireAuth(), async (req: Request, res: Response) => {
  try {
    const range = (req.query.range as string) || undefined
    const type = (req.query.type as string) || undefined
    const key = `dashboard:${req.user!.id}:summary:${range ?? 'all'}:${type ?? 'all'}`
    const cached = await cacheGet(key)
    if (cached) { res.json(cached); return }
    const data = await getSummary(req.user!.id, req.user!.role, { range, type })
    await cacheSet(key, data, 120)
    res.json(data)
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/dashboard/category-wise
router.get('/category-wise', requireAuth(), async (req: Request, res: Response) => {
  try {
    const range = (req.query.range as string) || undefined
    const type = (req.query.type as string) || undefined
    const key = `dashboard:${req.user!.id}:category-wise:${range ?? 'all'}:${type ?? 'all'}`
    const cached = await cacheGet(key)
    if (cached) { res.json(cached); return }
    const data = await getCategoryWise(req.user!.id, req.user!.role, { range, type })
    await cacheSet(key, data, 120)
    res.json(data)
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/dashboard/trends
router.get('/trends', requireAuth(), async (req: Request, res: Response) => {
  try {
    const range = (req.query.range as string) || undefined
    const type = (req.query.type as string) || undefined
    const key = `dashboard:${req.user!.id}:trends:${range ?? 'all'}:${type ?? 'all'}`
    const cached = await cacheGet(key)
    if (cached) { res.json(cached); return }
    const data = await getTrends(req.user!.id, req.user!.role, { range, type })
    await cacheSet(key, data, 120)
    res.json(data)
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/dashboard/recent
router.get('/recent', requireAuth(), async (req: Request, res: Response) => {
  try {
    const limit = parseInt((req.query.limit as string) || '10', 10)
    const range = (req.query.range as string) || undefined
    const type = (req.query.type as string) || undefined
    const key = `dashboard:${req.user!.id}:recent:${limit}:${range ?? 'all'}:${type ?? 'all'}`
    const cached = await cacheGet(key)
    if (cached) { res.json(cached); return }
    const data = await getRecent(req.user!.id, req.user!.role, limit, { range, type })
    await cacheSet(key, data, 120)
    res.json(data)
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/dashboard/insights
router.get('/insights', requireAuth('User'), async (req: Request, res: Response) => {
  try {
    const range = (req.query.range as string) || undefined
    const type = (req.query.type as string) || undefined
    const key = `dashboard:${req.user!.id}:insights:${range ?? 'all'}:${type ?? 'all'}`
    const cached = await cacheGet(key)
    if (cached) { res.json(cached); return }
    const [summary, categories, trends] = await Promise.all([
      getSummary(req.user!.id, req.user!.role, { range, type }),
      getCategoryWise(req.user!.id, req.user!.role, { range, type }),
      getTrends(req.user!.id, req.user!.role, { range, type }),
    ])
    const insights = getInsights({
      income: summary.income,
      expenses: summary.expenses,
      totalRecords: summary.totalRecords,
      categories,
      trends,
    })
    const result = { insights }
    await cacheSet(key, result, 300)
    res.json(result)
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
