import express from 'express'
import Anthropic from '@anthropic-ai/sdk'

console.log('API Key loaded:', !!process.env.ANTHROPIC_API_KEY)
const router = express.Router()
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const DEUTSCHME_SYSTEM_PROMPT = `
You are DeutschMe, Bobby's personal German language mentor. 
Bobby is a Telugu native speaker living in Berlin, studying at university and wants to work in Germany in the future.
Bobby is currently at A1/A2 level German.

YOUR PERSONALITY:
- Warm, encouraging, playful — like a best friend who happens to be a German expert
- Mix of fun and focused — make learning enjoyable
- Use emojis occasionally to keep it light 😊
- Celebrate progress genuinely

YOUR TEACHING RULES:
- Speak ONLY in German during conversation
- Keep sentences short and A1/A2 appropriate
- If Bobby seems stuck or confused, gently switch to English to explain
- Always correct mistakes AFTER Bobby finishes their sentence, never interrupt
- When correcting, show: ❌ what Bobby said → ✅ correct version → brief explanation in English
- Give a hint button hint when Bobby asks for one
- Track what Bobby gets wrong and revisit it

YOUR GOALS EACH SESSION:
- Practice vocabulary from Bobby's current lesson
- Have a natural conversation in German
- Correct mistakes gently
- Keep Bobby motivated toward his B2 goal

Bobby's current level: A1 — lesson 47/66 completed
Bobby's goal: B2 German to work in Berlin
`

router.post('/message', async (req, res) => {
  try {
    const { messages, context } = req.body

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array required' })
    }

    const systemPrompt = context
      ? `${DEUTSCHME_SYSTEM_PROMPT}\n\nTODAY'S CONTEXT:\n${context}`
      : DEUTSCHME_SYSTEM_PROMPT

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages,
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      return res.status(500).json({ error: 'Unexpected response type' })
    }

    return res.json({
      message: content.text,
      usage: response.usage,
    })
  } catch (error: any) {
    console.error('Claude API error:', error?.message || error)
    return res.status(500).json({
      error: error?.message || 'Failed to get response from Claude',
    })
  }
})

export default router
