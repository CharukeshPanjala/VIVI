# VIVI — TECH SPEC
### How it's built. Agent architecture, AI strategy, data flows.
> *Reference this when making engineering decisions. Every technical choice serves the product.*

---

## STACK

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL (Railway) |
| ORM | Prisma v5 |
| Auth | Clerk (abstracted — swappable) |
| AI | Anthropic Claude (abstracted — swappable) |
| Frontend hosting | Netlify |
| Backend hosting | Railway |

---

## THE ABSTRACTION RULE

**No vendor lock-in, ever.**

- All auth calls go through `src/services/auth.ts` (frontend) and `src/middleware/auth.ts` (backend). Nothing imports Clerk directly except these two files.
- All AI calls go through `src/services/ai.ts`. Nothing imports `@anthropic-ai/sdk` directly except this file.
- Swapping providers = changing one file. The rest of the app never knows.

---

## AGENT ARCHITECTURE

### Agent Roles

| Agent | Function |
|---|---|
| **Brain Agent** | Orchestrates everything. Builds UserModel. Routes to the right character agent. Coordinates all background agents. |
| **Anna Agent** | Conversation, correction, emotional support. Reads UserModel + CharacterMemory. Returns response + expression. |
| **Max Agent** | Casual conversation, slang, real speech patterns. Same pattern as Anna. |
| **Luna Agent** | Grammar focus, structured teaching, precision. Same pattern. |
| **Finn Agent** | Scenario creation, storytelling, immersive practice. Same pattern. |
| **[Extended agents]** | Same pattern for each additional character. World Bible personality → system prompt → response. |
| **Curriculum Agent** | Processes YouTube URLs. Extracts vocab, grammar points, generates questions, creates lesson record. |
| **Cards Agent** | SM-2 spaced repetition algorithm. Schedules reviews. Tracks retention. Pure algorithm — no AI. |
| **Progress Agent** | Awards XP, updates streaks, generates session Notes. Checks for unlocks after XP change. Pure logic — no AI except Note generation. |
| **Coach Agent** | Silent background monitor. Runs after every session. Generates weekly CoachReport. Triggers AwayMessages when Bobby is absent. |
| **Memory Agent** | Weekly compression job. Compresses sessions into UserMemory and CharacterMemory. Deletes sessions older than 30 days. |

---

## THE SESSION FLOW

Every conversation follows this sequence:

```
1. Bobby sends a message
        ↓
2. Brain Agent receives it
        ↓
3. buildUserModel(userId, characterId)
   — 12 parallel DB queries, ~50-80ms
        ↓
4. buildCharacterPrompt(userModel)
   — assembles system prompt from World Bible + UserModel
        ↓
5. chat(messages, systemPrompt, model)
   — AI call with full context
        ↓
6. Parse response
   — extract [expression:X] prefix
   — extract corrections if any
   — extract new vocab if any
        ↓
7. Save to DB
   — new Message record
   — update CharacterEmotionalState if needed
        ↓
8. Return to frontend
   — message text
   — expression state
   — any corrections/vocab for UI
```

---

## USERMODEL

Built before every session. All 12 queries run in parallel via `Promise.all`. Total time: ~50-80ms.

```typescript
type UserModel = {
  // Identity
  userId: string
  name: string
  nativeLanguage: string
  targetLanguage: string
  level: Level
  goals: string[]
  tier: 'FREE' | 'PRO'

  // Progress
  totalXP: number
  currentStreak: number
  sessionCount: number
  onboardingCompleted: boolean

  // Learning profile
  recentMistakes: Mistake[]        // last 10, with severity
  masteredVocab: VocabCard[]       // SM-2 interval > 14
  learningVocab: VocabCard[]       // currently in rotation
  vocabStats: { new: number, learning: number, mastered: number }

  // Session history
  recentSessions: Session[]        // last 5 with summaries

  // Memory
  userMemory: UserMemory | null
  characterMemory: CharacterMemory | null
  characterEmotionalState: CharacterEmotionalState | null
  characterDailyLife: CharacterDailyLife | null

  // Insights
  latestCoachReport: CoachReport | null
}
```

File: `agents/brain/src/services/userModel.ts`

---

## PROMPT ARCHITECTURE

Each character has two files:

**`src/characters/[name].ts`** — Static. The World Bible in TypeScript. Who they are. Never changes after initial write.

**`src/prompts/[name].ts`** — Dynamic. Takes UserModel, returns full system prompt string. Runs before every session.

The system prompt structure:
```
1. Character identity (from characters/[name].ts)
2. Current emotional state + daily life
3. Who Bobby is (from UserMemory)
4. Their relationship (from CharacterMemory)  
5. Last session
6. Memorable moments (last 5)
7. Correction style rules
8. Bond-level voice calibration
9. Example exchanges (from CONVERSATION_EXAMPLES.md — 3-4 relevant ones)
10. What she won't do (hard constraints)
```

---

## AI MODEL STRATEGY

### Model Assignment

| Feature | Free Tier | Pro Tier |
|---|---|---|
| Character conversations | Claude Haiku | Claude Sonnet |
| Vocab extraction (lessons) | Claude Haiku | Claude Haiku |
| Coach report generation | Claude Haiku | Claude Sonnet |
| Memory compression | Claude Haiku | Claude Haiku |
| Watch party comments | Claude Sonnet (one-time generation, cached) | Claude Sonnet |

### Why Haiku vs Sonnet matters for characters
The difference between Haiku and Sonnet on a well-written system prompt is significant. Sonnet holds character voice better across long conversations, makes more nuanced corrections, and handles emotional complexity more naturally. This is the core Pro value proposition — not more features, a noticeably better Anna.

### The ai.ts service

```typescript
// agents/brain/src/services/ai.ts
export type AIModel = 'haiku' | 'sonnet'

export async function chat({
  messages,
  systemPrompt,
  model = 'haiku',
  maxTokens = 1024
}): Promise<string>
```

Nothing else in the codebase imports `@anthropic-ai/sdk`. One file. Fully swappable.

---

## BACKGROUND JOBS

| Job | Frequency | What it does |
|---|---|---|
| **CharacterDailyLife generator** | Daily, 6am | Generates a new day of life events for each active character. Mood, activities, highlight, weather. |
| **Memory compression** | Weekly, Sunday midnight | Compresses sessions into UserMemory + CharacterMemory. Deletes sessions > 30 days old. |
| **Review scheduler** | Daily, 8am | Updates SM-2 nextReviewDate for all VocabCards due today. |
| **Streak checker** | Daily, midnight | Resets streaks for users who missed yesterday. Updates longestStreak if needed. |
| **Coach report** | Weekly, Monday 7am | Generates CoachReport for active users. Creates Notification. |
| **Weekly digest** | Weekly, Monday 7am | Generates WeeklyDigest for active users. |
| **Away message generator** | On trigger | Coach Agent detects absence (24h+). Generates AwayMessage from appropriate character. |

---

## DATABASE

18 tables. See `prisma/schema.prisma` for full schema.

Key design decisions:
- `CharacterMemory` — one row per (userId, characterId) pair. Upserted after each session.
- `CharacterEmotionalState` — one row per (userId, characterId) pair. Updated after each session.
- `CharacterDailyLife` — one row per (characterId, date). Global — same for all users on a given day.
- Sessions deleted after 30 days. Memory lives in UserMemory + CharacterMemory, not raw sessions.
- All cascade deletes via `onDelete: Cascade` — deleting a user cleans up everything.

---

## MEMORY COMPRESSION — TECHNICAL

Weekly job reads all sessions from the past 7 days for each user. Sends to Claude Haiku with the instruction: "compress these sessions into the existing UserMemory and CharacterMemory records. Update the summaries to reflect the new information. Preserve the specific memorable moments. Write in first person from the character's perspective."

Output replaces the relevant fields in UserMemory and CharacterMemory.

Raw sessions are then deleted.

This is the same pattern Claude itself uses — compress, retain the essence, discard the raw data.

---

## ERROR HANDLING PRINCIPLES

- AI errors are never surfaced to the user as technical errors
- If the AI call fails: retry once, then return a character-appropriate message that feels human
- Database errors: log, return graceful error, never crash the session
- All errors logged with context for debugging
- User never sees a stack trace or technical error message

---

## BRANCH STRATEGY

```
main                  — production, always deployable
feat/ai-foundation    — Sprint 2 current branch
feat/[sprint-name]    — future sprints
```

PRs require review before merge to main. No direct commits to main.
