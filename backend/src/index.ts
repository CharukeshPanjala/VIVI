import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import chatRouter from './routes/chat'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'DeutschMe backend is running! 🇩🇪',
  })
})

app.use('/api/chat', chatRouter)

app.listen(PORT, () => {
  console.log(`🇩🇪 DeutschMe backend running on port ${PORT}`)
})
