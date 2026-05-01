import express from 'express'
import { getChatResponse } from '../services/claude'

const router = express.Router()

router.post('/message', async (req, res) => {
  try {
    const { messages, context } = req.body

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array required' })
    }

    const recentMessages = messages.slice(-10)
    const message = await getChatResponse(recentMessages, context)

    return res.json({ message })
  } catch (error) {
    const err = error as { message?: string }
    console.error('Claude API error:', err.message)
    return res.status(500).json({
      error: err.message ?? 'Failed to get response from Claude',
    })
  }
})

export default router
