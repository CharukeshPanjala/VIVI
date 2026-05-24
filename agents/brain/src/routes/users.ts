import { Router } from 'express'
import { prisma } from '../db/client'
import { requireAuth } from '../middleware/auth'

const router = Router()

// POST /api/users/sync
// Called by frontend after every sign in — creates or updates the user in our DB
router.post('/sync', requireAuth, async (req, res) => {
  try {
    const { email, name } = req.body

    const user = await prisma.user.upsert({
      where: { clerkId: req.userId },
      update: {
        lastActiveDate: new Date(),
      },
      create: {
        clerkId: req.userId,
        email,
        name: name ?? null,
      },
    })

    res.json({ user })
  } catch (error) {
    console.error('User sync error:', error)
    res.status(500).json({ error: 'Failed to sync user' })
  }
})

// GET /api/users/me
// Returns the current user's full profile
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.userId },
    })

    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    res.json({ user })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Failed to get user' })
  }
})

export default router
