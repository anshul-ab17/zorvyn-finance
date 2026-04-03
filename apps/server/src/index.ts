import dotenv from 'dotenv'
import path from 'path'
// Load root .env before any @repo/* imports (Prisma reads DATABASE_URL on init)
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') })

import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.routes'
import usersRoutes from './routes/users.routes'
import recordsRoutes from './routes/records.routes'
import dashboardRoutes from './routes/dashboard.routes'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))

app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/records', recordsRoutes)
app.use('/api/dashboard', dashboardRoutes)

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

app.listen(PORT, () => {
  console.log(`[server] Running on http://localhost:${PORT}`)
})
