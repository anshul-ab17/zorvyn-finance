import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') })

import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
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

//API rate limit — 100 req/ min
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
})

// limit for auth endpoints — 10 attempts/15 miN
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later.' },
})

app.use('/api', apiLimiter)
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)

app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/records', recordsRoutes)
app.use('/api/dashboard', dashboardRoutes)

app.get('/health', (req, res) => {
  res.status(200).send('OK')
})

app.listen(PORT, () => {
  console.log(`[server] Running on http://localhost:${PORT}`)
})
