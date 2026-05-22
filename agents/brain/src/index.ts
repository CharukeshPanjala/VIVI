import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import chatRouter from './routes/chat'
import { requestLogger } from './middleware/logger'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())
app.use(requestLogger)

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    agent: 'brain',
    message: 'Vivi Brain Agent is running! 🧠',
    timestamp: new Date().toISOString(),
  })
})

app.use('/api/chat', chatRouter)

app.listen(PORT, () => {
  console.log(`🧠 Vivi Brain Agent running on port ${PORT}`)
})
