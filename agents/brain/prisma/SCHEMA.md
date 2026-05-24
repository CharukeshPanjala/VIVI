Sorry about that — the nested code blocks broke it. Here's the fix: don't wrap it in a code block at all. Just paste the raw markdown directly into the file. Here it is:

---

# Vivi — Database Schema Reference

Complete reference for all 18 tables. Every decision made intentionally during Sprint 1 planning.

---

## 1. User

The core of the entire system. One row per person who signs up to Vivi. Stores identity, learning profile, progress, and monetisation tier. The centre of every relation in the DB.

| Field               | Type                    | Description                                                                   |
| ------------------- | ----------------------- | ----------------------------------------------------------------------------- |
| id                  | cuid                    | Primary key                                                                   |
| clerkId             | String unique           | Clerk's user ID — links our DB user to Clerk auth session                     |
| email               | String unique           | Stored so we can send emails without hitting Clerk API every time             |
| name                | String?                 | Display name — nullable, may not exist on first sign up                       |
| nativeLanguage      | String default "en"     | Language they already speak                                                   |
| targetLanguage      | String default "de"     | Language they are learning                                                    |
| level               | Level enum default A1_1 | Current proficiency level A1_1 through C2_2                                   |
| goals               | String[]                | Why they're learning — "travel", "business", "family" — Anna references these |
| totalXP             | Int default 0           | Lifetime XP earned                                                            |
| currentStreak       | Int default 0           | Days active in a row — resets if they miss a day                              |
| longestStreak       | Int default 0           | Personal best streak — never resets                                           |
| lastActiveDate      | DateTime?               | Used to calculate whether streak should increment or reset                    |
| tier                | Tier enum default FREE  | FREE or PRO — controls feature gates throughout the app                       |
| isSuperUser         | Boolean default false   | Admin access — manually set for Bobby's account                               |
| stripeCustomerId    | String?                 | Set when payment flow begins — links User to Stripe                           |
| lastWatchedLessonId | String?                 | Last video watched — drives Netflix-style resume on home screen               |
| lastWatchedAt       | DateTime?               | When they last watched a video                                                |
| onboardingCompleted | Boolean default false   | Has the user finished the first Anna onboarding conversation                  |
| createdAt           | DateTime                | When they signed up — auto-set                                                |
| updatedAt           | DateTime                | Last time any field changed — auto-managed by Prisma                          |

**Level enum:** A1_1, A1_2, A2_1, A2_2, B1_1, B1_2, B2_1, B2_2, C1_1, C1_2, C2_1, C2_2

**Tier enum:** FREE, PRO

---

## 2. Session

A container for one conversation between a user and a character. Every time a user opens the app and starts chatting, that is one session. Everything that happens — messages, mistakes, XP, notes — links back here. Raw sessions compressed weekly and deleted after 30 days.

| Field       | Type             | Description                                                                     |
| ----------- | ---------------- | ------------------------------------------------------------------------------- |
| id          | cuid             | Primary key                                                                     |
| userId      | String           | Which user                                                                      |
| characterId | String           | Which character e.g. "anna" — character config lives in code not DB             |
| sessionType | SessionType enum | What kind of session                                                            |
| topic       | String?          | What they talked about e.g. "ordering food at a café"                           |
| xpEarned    | Int default 0    | XP earned this session — added to User.totalXP when session ends                |
| summary     | Text?            | Auto-generated when session ends — agents read this next session for continuity |
| startedAt   | DateTime         | When the session began — auto-set                                               |
| endedAt     | DateTime?        | Null means session is still active                                              |

**SessionType enum:** SOLO, GROUP, STORY, WATCH_PARTY

---

## 3. Message

Every single line of conversation inside a session. Two rows per exchange — one USER row, one ASSISTANT row. Deleted with the session after 30 days.

| Field       | Type      | Description                                                                           |
| ----------- | --------- | ------------------------------------------------------------------------------------- |
| id          | cuid      | Primary key                                                                           |
| sessionId   | String    | Which session this message belongs to                                                 |
| characterId | String?   | Null when role is USER — "anna"/"max" when ASSISTANT. Needed for group sessions       |
| role        | Role enum | USER or ASSISTANT                                                                     |
| content     | String    | The actual text of the message                                                        |
| expression  | String?   | Character's facial expression e.g. "happy", "thinking", "proud" — drives UI animation |
| createdAt   | DateTime  | When the message was sent                                                             |

**Role enum:** USER, ASSISTANT

---

## 4. Mistake

Every grammar or vocabulary error Anna catches during a session. Anna logs silently — never interrupts the flow. At session end she surfaces the top 3 most important ones. The Coach reads these weekly to spot patterns.

| Field       | Type                  | Description                                         |
| ----------- | --------------------- | --------------------------------------------------- |
| id          | cuid                  | Primary key                                         |
| userId      | String                | Which user                                          |
| sessionId   | String                | Which session it happened in                        |
| original    | String                | What the user said — "Ich haben Hunger"             |
| corrected   | String                | What it should be — "Ich habe Hunger"               |
| explanation | String                | Why — "haben conjugates to habe for ich"            |
| topic       | String?               | Category e.g. "verb conjugation", "word order"      |
| severity    | Severity enum         | How important this mistake is                       |
| practiced   | Boolean default false | Has the user drilled this mistake since it was made |
| createdAt   | DateTime              | When it happened                                    |

**Severity enum:** MINOR, NOTABLE, CRITICAL

---

## 5. VocabCard

A flashcard for every word the user has learned or saved. Runs the SM-2 spaced repetition algorithm — the same system Anki uses. The better you know a word, the less you see it. Words you struggle with come back daily.

| Field           | Type              | Description                                      |
| --------------- | ----------------- | ------------------------------------------------ |
| id              | cuid              | Primary key                                      |
| userId          | String            | Which user                                       |
| word            | String            | The German word e.g. "Entschuldigung"            |
| translation     | String            | English meaning                                  |
| exampleSentence | String?           | e.g. "Entschuldigung, wo ist der Bahnhof?"       |
| sourceType      | SourceType enum   | Where the word came from                         |
| sourceId        | String?           | Which session or lesson it came from             |
| interval        | Int default 1     | SM-2: days until next review                     |
| repetitions     | Int default 0     | SM-2: how many times reviewed correctly in a row |
| easinessFactor  | Float default 2.5 | SM-2: how easy this word is for this user        |
| nextReviewDate  | DateTime          | When to show this card next                      |
| status          | CardStatus enum   | Current learning status                          |
| createdAt       | DateTime          | When the card was created                        |
| updatedAt       | DateTime          | Last time SM-2 fields were updated               |

**SourceType enum:** CHAT, LESSON, MANUAL

**CardStatus enum:** NEW, LEARNING, MASTERED

---

## 6. Lesson

A YouTube video that has been processed by the brain. User pastes a URL, the brain fetches the transcript, extracts vocabulary and grammar, generates quiz questions, and saves it all here.

| Field         | Type       | Description                                                            |
| ------------- | ---------- | ---------------------------------------------------------------------- |
| id            | cuid       | Primary key                                                            |
| userId        | String     | Which user added this video                                            |
| videoUrl      | String     | The YouTube URL                                                        |
| videoTitle    | String     | Fetched from YouTube                                                   |
| thumbnail     | String?    | YouTube thumbnail URL                                                  |
| summary       | String[]   | Key points extracted from the video                                    |
| vocabWords    | Json       | Extracted words with translations and examples — source for VocabCards |
| grammarPoints | String[]   | Grammar concepts covered e.g. "dative case", "modal verbs"             |
| questions     | Json       | Quiz questions generated from the video content                        |
| level         | Level enum | Difficulty level of the video e.g. A2_1                                |
| language      | String     | Which language e.g. "de"                                               |
| createdAt     | DateTime   | When it was added                                                      |

---

## 7. UserLesson

Tracks a user's personal progress through each video. The Lesson table is the video itself — UserLesson is their relationship with that video. One row per user per video.

| Field          | Type                  | Description                                              |
| -------------- | --------------------- | -------------------------------------------------------- |
| id             | cuid                  | Primary key                                              |
| userId         | String                | Which user                                               |
| lessonId       | String                | Which lesson                                             |
| completed      | Boolean default false | Did they finish the video                                |
| completedAt    | DateTime?             | When they finished                                       |
| watchedSeconds | Int default 0         | Exactly where they paused — enables Netflix-style resume |
| duration       | Int?                  | Total video length in seconds — shows "6 min left" in UI |
| vocabExtracted | Boolean default false | Have VocabCards been created from this lesson yet        |
| createdAt      | DateTime              | When they started the lesson                             |

**Unique constraint:** userId + lessonId — one progress row per user per video

---

## 8. Note

Auto-generated after every session and lesson. Bobby never writes anything manually. A clean, structured summary he can read back later — his personal study diary.

| Field     | Type          | Description                                                                    |
| --------- | ------------- | ------------------------------------------------------------------------------ |
| id        | cuid          | Primary key                                                                    |
| userId    | String        | Which user                                                                     |
| type      | NoteType enum | Was this from a chat or a video                                                |
| sourceId  | String        | Which session or lesson generated this note                                    |
| title     | String        | e.g. "Session with Anna — Café Morgen"                                         |
| content   | Json          | Structured note — vocab learned, mistakes made, topics covered, grammar points |
| createdAt | DateTime      | When it was generated                                                          |

**NoteType enum:** CHAT, LESSON

---

## 9. UserMemory

The shared brain that all agents read at the start of every session. One row per user — always updated, never duplicated. Compressed weekly. Makes every agent feel like they truly know the user — not just as a learner but as a person.

| Field              | Type          | Description                                                                               |
| ------------------ | ------------- | ----------------------------------------------------------------------------------------- |
| id                 | cuid          | Primary key                                                                               |
| userId             | String unique | One memory per user                                                                       |
| summary            | Text          | Full picture of who this user is — compressed weekly by the background job                |
| personalDetails    | Json          | Things the user has shared — job, hobbies, why learning German, family, where they live   |
| milestones         | Json          | Memorable moments — first full German sentence, first level up, first 100 XP              |
| learningStyle      | String?       | How this user learns best — "needs repetition", "responds well to humour"                 |
| motivations        | String[]      | Why they are learning — "job interview", "talk to neighbours", "travel"                   |
| personality        | String?       | What characters have observed — "determined, impatient with himself, competitive"         |
| struggles          | String[]      | Recurring weak areas — "word order", "accusative case", "remembering genders"             |
| strengths          | String[]      | What they are genuinely good at — "pronunciation", "vocabulary retention"                 |
| currentFocus       | String?       | What they are actively working on right now                                               |
| lifeContext        | Json          | Bigger life picture — "preparing for job interview in June", "moving to Munich next year" |
| interests          | String[]      | Hobbies and passions — "football, tech, cooking" — characters reference naturally         |
| emotionalPatterns  | String?       | How this user reacts emotionally — "gets discouraged after mistakes, needs encouragement" |
| languageAnxiety    | String?       | How they feel about speaking — "confident in text, scared to speak out loud"              |
| communicationStyle | String?       | How they talk — "casual, uses humour, short messages" — characters mirror this            |
| practicePattern    | String?       | When and how they usually practise — "evenings after work, 20 min sessions"               |
| lastSeenAt         | DateTime      | When they last opened the app                                                             |
| updatedAt          | DateTime      | When the last compression ran                                                             |

---

## 10. CharacterMemory

The individual bond between a user and each character. One row per user per character. Anna's row is completely different from Max's row — each has their own history, their own relationship, their own last conversation with this user.

| Field                   | Type          | Description                                                                                    |
| ----------------------- | ------------- | ---------------------------------------------------------------------------------------------- |
| id                      | cuid          | Primary key                                                                                    |
| userId                  | String        | Which user                                                                                     |
| characterId             | String        | Which character e.g. "anna"                                                                    |
| bondLevel               | Int default 1 | 1–100, grows with every session together                                                       |
| bondSummary             | Text?         | Compressed weekly — the full story of this relationship in one paragraph                       |
| lastConversationSummary | Text?         | What they talked about last session specifically                                               |
| firstMeetMemory         | String?       | How they first met — referenced on anniversaries and milestones                                |
| insideJokes             | String[]      | Running jokes between this user and this character                                             |
| memorableMoments        | String[]      | Key moments this character witnessed — "first full sentence without help — 12 March"           |
| currentEmotion          | String?       | How this character feels about this user right now — "proud", "worried", "excited"             |
| currentEmotionReason    | String?       | Why — "Bobby nailed accusative case yesterday"                                                 |
| characterOpinionOfUser  | String?       | What this character genuinely thinks — "Anna sees Bobby as determined but too hard on himself" |
| currentWorry            | String?       | Something this character is worried about — "Bobby hasn't practised in 2 weeks"                |
| currentPride            | String?       | Something this character is proud of — "Bobby just hit A2_1"                                   |
| sharedTopics            | String[]      | Topics they always come back to — "football", "Bobby's job interview"                          |
| relationshipStage       | String?       | Where the relationship is — "new", "warming up", "close friends", "deep bond"                  |
| howCharacterTalksToUser | String?       | This character's unique style with this user — "teases gently, celebrates every win loudly"    |
| unspokenThings          | String?       | Things the character has noticed but never said out loud                                       |
| growthWitnessed         | String[]      | Specific moments of growth this character personally witnessed                                 |
| rituals                 | String[]      | Things they always do together — "always start with coffee order practice"                     |
| missYouThreshold        | Int default 3 | Days away before this character starts missing the user and sends a message                    |
| characterMood           | String?       | This character's general mood this week — comes from CharacterDailyLife                        |
| lastGift                | String?       | Last thing this character gave the user — a compliment, tip, or challenge                      |
| protectiveLevel         | Int default 5 | 1–10 — how protective this character is of this user                                           |
| lastSeenAt              | DateTime?     | When this user last talked to this character                                                   |
| updatedAt               | DateTime      | When last compression ran                                                                      |

**Unique constraint:** userId + characterId — one bond per user per character

---

## 11. CharacterEmotionalState

How a character feels right now — about this specific user. Updated after every single session, not just weekly. This is what makes characters feel alive in the moment rather than just historically aware.

| Field              | Type          | Description                                                                                       |
| ------------------ | ------------- | ------------------------------------------------------------------------------------------------- |
| id                 | cuid          | Primary key                                                                                       |
| userId             | String        | Which user                                                                                        |
| characterId        | String        | Which character                                                                                   |
| currentEmotion     | String?       | "proud", "worried", "excited", "nostalgic", "missing you"                                         |
| emotionReason      | String?       | Why — "Bobby nailed accusative case yesterday"                                                    |
| personalityRead    | String?       | What this character thinks of the user right now — "pushing himself too hard this week"           |
| currentWorry       | String?       | "Bobby seemed stressed tonight, not himself"                                                      |
| currentPride       | String?       | "Bobby just hit A2_1 — Anna is bursting with pride"                                               |
| energyLevel        | String?       | "high", "calm", "gentle" — affects how the character shows up tonally                             |
| hopeForNextSession | String?       | What the character is hoping happens next time — "hoping Bobby tries a full paragraph unprompted" |
| disappointment     | String?       | Something that did not go well — "Bobby gave up too quickly tonight"                              |
| excitementLevel    | Int default 5 | 1–10 — how excited is this character to see this user right now                                   |
| missYouMessage     | String?       | Generated when user is away 3+ days — waiting for them when they return                           |
| lastEmotionUpdate  | String?       | What triggered the last update — "session_ended", "daily_job", "away_timer"                       |
| emotionHistory     | Json          | Last 5 emotional states with timestamps — "I've been worried about you all week"                  |
| updatedAt          | DateTime      | Updated after every session                                                                       |

**Unique constraint:** userId + characterId

---

## 12. CharacterDailyLife

Generated every morning by a background job. One row per character per day. The character's living story inside Vivia — their mood, their day, their plans, their thoughts. Completely independent of users. When Bobby opens the app, Anna has already lived part of her day.

| Field                | Type     | Description                                                                                             |
| -------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| id                   | cuid     | Primary key                                                                                             |
| characterId          | String   | Which character                                                                                         |
| date                 | DateTime | One row per character per day                                                                           |
| mood                 | String   | "happy", "tired", "nostalgic", "excited", "melancholic"                                                 |
| moodReason           | String   | Why — "had a wonderful morning at the market"                                                           |
| morningActivity      | String?  | What they did this morning — "Anna walked to Café Morgen, had her usual oat milk latte"                 |
| afternoonActivity    | String?  | What they did in the afternoon                                                                          |
| eveningActivity      | String?  | What they did or plan to do this evening                                                                |
| highlight            | String   | The one most interesting thing that happened today                                                      |
| thought              | String?  | Something they were reflecting on — "how much language connects strangers"                              |
| characterInteraction | String?  | Did they interact with another character — "Had coffee with Max, he was being dramatic as usual"        |
| worldEvent           | String?  | Something happening in Vivia today — "Big football match tonight, Max is losing his mind"               |
| weather              | String?  | Vivia's weather today — "rainy Berlin morning" — affects mood and conversation naturally                |
| lessonLearned        | String?  | Personal reflection today — "Patience is its own kind of courage"                                       |
| recommendation       | String?  | Something to share with users — "Found the perfect podcast for A2 learners today"                       |
| weekendPlan          | String?  | What they are doing this weekend — mentioned Friday, referenced Monday                                  |
| upcomingEvent        | String?  | Something happening soon — "Max has a football tournament next week"                                    |
| longTermPlan         | String?  | Big future plan — "Luna is planning a trip to Japan at year end"                                        |
| currentGoal          | String?  | What the character is personally working towards — "Anna is trying to read one book a month in English" |
| excitement           | String?  | Something they are really looking forward to                                                            |
| concern              | String?  | Something worrying them in their own life — "Max is stressed about his flatmate moving out"             |
| recentTravel         | String?  | Where they have been recently — "Luna just got back from Vienna, full of stories"                       |
| tradition            | String?  | Regular things they do — "Anna always visits the Christmas market in December"                          |
| yearEndPlan          | String?  | Big end of year plans — "Finn is flying home to Ireland for Christmas"                                  |
| currentObsession     | String?  | What they are currently into — "Max is obsessed with a podcast about German history"                    |

**Unique constraint:** characterId + date — one day per character

---

## 13. AwayMessage

When a user has not opened the app for a few days, characters leave messages waiting for them. Characters also reach out randomly when something interesting happens — trending posts, world events, news, things that made them think of the user. Bobby's phone feels like a real friend texting him.

| Field            | Type                  | Description                                                                                        |
| ---------------- | --------------------- | -------------------------------------------------------------------------------------------------- |
| id               | cuid                  | Primary key                                                                                        |
| userId           | String                | Which user                                                                                         |
| characterId      | String                | Which character sent it                                                                            |
| message          | Text                  | What the character wants to say                                                                    |
| messageType      | MessageType enum      | What kind of message this is                                                                       |
| platform         | String?               | Where the content came from — "Instagram", "X", "Reddit", "TikTok", "Netflix", "Spotify"           |
| contentCategory  | String?               | Type of content — "meme", "news", "trending", "cultural", "sport", "music"                         |
| mediaUrl         | String?               | Link to the content being shared                                                                   |
| mediaTitle       | String?               | Title of what they are sharing                                                                     |
| trendingScore    | Int?                  | How viral this content is right now                                                                |
| isRandom         | Boolean default false | Was this triggered randomly — character just thought of the user                                   |
| emotion          | String?               | How the character feels sending this — "excited", "worried", "amused"                              |
| requiresResponse | Boolean default false | Did the character ask something that needs a reply — drives notification                           |
| expiresAt        | DateTime?             | Some messages are time sensitive — old news is not relevant                                        |
| trigger          | String                | What triggered this — "away_3_days", "milestone_approaching", "streak_at_risk", "trending_content" |
| createdAt        | DateTime              | When it was generated                                                                              |
| readAt           | DateTime?             | Null means user has not seen it yet                                                                |

**MessageType enum:** MISSING_YOU, WORLD_EVENT, NEWS, REDDIT, INSTAGRAM, FACEBOOK, X_TWITTER, TIKTOK, YOUTUBE, PODCAST, BOOK, MUSIC, SPORT, FOOD, TRAVEL, TECHNOLOGY, CULTURE, LANGUAGE_TIP, MEME, PERSONAL_THOUGHT, MOVIE_TV, WEATHER, MILESTONE_APPROACHING, RANDOM

---

## 14. CoachReport

Generated every Sunday night by the Coach agent. Bobby's weekly personal coaching report. Not dry stats — a genuine coaching note with honest feedback, specific observations, and one clear goal for next week.

| Field                 | Type      | Description                                                                                                               |
| --------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------- |
| id                    | cuid      | Primary key                                                                                                               |
| userId                | String    | Which user                                                                                                                |
| weekSummary           | Text      | Overall picture of the week — personalised, not generic                                                                   |
| strongPoints          | String[]  | What they genuinely nailed this week                                                                                      |
| focusAreas            | String[]  | What needs work next week                                                                                                 |
| mistakePatterns       | Json      | Recurring mistakes grouped by category — "word order: 6 times", "accusative: 4 times"                                     |
| recommendedLesson     | String?   | Specific YouTube lesson matching their weak areas                                                                         |
| mistakeToFix          | String?   | The one most important mistake to drill this week                                                                         |
| motivationalNote      | String    | Personal, genuine encouragement based on their specific journey                                                           |
| honestFeedback        | Text      | The one thing the coach would say if being completely honest — no sugarcoating                                            |
| xpThisWeek            | Int       | XP earned this week                                                                                                       |
| sessionsThisWeek      | Int       | How many sessions completed                                                                                               |
| streakStatus          | String    | "On fire", "Recovering", "Consistent"                                                                                     |
| nextWeekGoal          | String    | One specific, achievable goal for next week                                                                               |
| levelProgress         | String?   | "You are 73% of the way to A2_2 — at this pace you will hit it in 3 weeks"                                                |
| bestSession           | String?   | The highlight session of the week                                                                                         |
| hardestMoment         | String?   | Acknowledges struggle honestly — "Thursday was tough, you hit a wall with modal verbs. That is completely normal at A2_1" |
| comparedToLastWeek    | String?   | Week over week comparison — "You practiced 2 more days than last week"                                                    |
| characterInsights     | Json      | What each character noticed this week — "Anna says your confidence in longer sentences is growing"                        |
| realWorldChallenge    | String?   | A real world task to try this week — "Order your coffee in German every morning"                                          |
| podcastRecommendation | String?   | Specific podcast episode matching current level and weak areas                                                            |
| grammarFocus          | String?   | One grammar concept to master this week with explanation                                                                  |
| celebrationMoment     | String?   | One specific thing worth genuinely celebrating                                                                            |
| progressChart         | Json      | XP per day, sessions per day — drives the progress chart in the app                                                       |
| vocabularyStats       | Json      | Words learned, mastered, due for review — full vocab picture                                                              |
| createdAt             | DateTime  | When it was generated                                                                                                     |
| readAt                | DateTime? | Has Bobby read it yet                                                                                                     |

---

## 15. WeeklyDigest

A light, fun weekly summary — like Spotify Wrapped but every week. Quick to read, feels like a celebration. Different from CoachReport which is deep analysis. The digest is the highlight reel. Never the same two weeks in a row — the job picks the most interesting insights for that specific week.

| Field                | Type      | Description                                                                    |
| -------------------- | --------- | ------------------------------------------------------------------------------ |
| id                   | cuid      | Primary key                                                                    |
| userId               | String    | Which user                                                                     |
| daysActive           | Int       | How many days practiced this week                                              |
| xpEarned             | Int       | Total XP this week                                                             |
| wordsLearned         | Int       | New vocab cards created                                                        |
| vocabMastered        | Int       | Words that hit MASTERED status this week                                       |
| sessionCount         | Int       | Total sessions this week                                                       |
| totalTimeSpent       | Int       | Total minutes practiced this week                                              |
| averageSessionLength | Int       | Average session length in minutes                                              |
| topCharacter         | String?   | Which character they talked to most                                            |
| longestSession       | Int?      | Longest single session in minutes                                              |
| bestDay              | String?   | Most productive day this week                                                  |
| bestTimeOfDay        | String?   | When they perform best — "You always do better in evening sessions"            |
| streakStatus         | String?   | Streak celebration — "7 days straight, your longest ever"                      |
| mistakesFixed        | Int       | Mistakes from previous weeks they no longer make                               |
| characterMessages    | Json      | Short personal notes from each character they talked to this week              |
| weekHighlight        | String?   | The single best moment of the week                                             |
| personalityInsight   | String?   | Fun observation — "You are a night owl learner who gets better under pressure" |
| weekRating           | String?   | Fun overall rating — "S tier week", "Solid B+ week", "Comeback week"           |
| globalRank           | String?   | Where they stand among all Vivi users — "Top 15% of learners this week"        |
| improvedSkills       | String[]  | Skills that measurably improved this week                                      |
| funFact              | String?   | Something interesting about their progress                                     |
| nextMilestone        | String?   | What is coming up — "50 more XP until Level 5"                                 |
| quote                | String?   | A meaningful German quote matching their level and journey — with translation  |
| nextWeekPreview      | String?   | What is coming — "Next week Anna wants to try a full restaurant roleplay"      |
| characterNote        | String    | A short fun note from one of their characters                                  |
| createdAt            | DateTime  | When generated                                                                 |
| readAt               | DateTime? | Has the user seen it                                                           |

---

## 16. XPTransaction

A log of every time a user earns XP. The User table stores the total but this table stores the full history. Powers the progress charts — XP per day, per session, per week.

| Field     | Type          | Description                          |
| --------- | ------------- | ------------------------------------ |
| id        | cuid          | Primary key                          |
| userId    | String        | Which user                           |
| amount    | Int           | How much XP was earned               |
| reason    | XPReason enum | What triggered the XP                |
| sourceId  | String?       | Which session or lesson triggered it |
| createdAt | DateTime      | When it was earned                   |

**XPReason enum:** SESSION_COMPLETED, LESSON_COMPLETED, STREAK_BONUS, MILESTONE, VOCAB_MASTERED, PERFECT_SESSION

---

## 17. Notification

System notifications. Streak reminders, level up alerts, review reminders, milestone achievements. Different from AwayMessage — these are app system messages, not character messages.

| Field     | Type                  | Description                                                                   |
| --------- | --------------------- | ----------------------------------------------------------------------------- |
| id        | cuid                  | Primary key                                                                   |
| userId    | String                | Which user                                                                    |
| type      | NotificationType enum | What kind of notification                                                     |
| title     | String                | Short headline — "Streak at risk!"                                            |
| body      | String                | Full message — "You have not practiced today. 7 day streak ends at midnight." |
| isRead    | Boolean default false | Has the user seen it                                                          |
| createdAt | DateTime              | When it was generated                                                         |
| readAt    | DateTime?             | When the user opened it                                                       |

**NotificationType enum:** STREAK_REMINDER, LEVEL_UP, REVIEW_DUE, MILESTONE_REACHED, COACH_REPORT_READY, DIGEST_READY, ACHIEVEMENT_UNLOCKED

---

## 18. Subscription

Tracks Stripe payment status per user. Is this user FREE or PRO? When does their subscription expire? The app checks this before unlocking premium features. Empty until Sprint 6 when payments go live.

| Field                | Type           | Description                                                          |
| -------------------- | -------------- | -------------------------------------------------------------------- |
| id                   | cuid           | Primary key                                                          |
| userId               | String unique  | One subscription per user                                            |
| stripeCustomerId     | String unique  | This user's ID in Stripe                                             |
| stripeSubscriptionId | String unique  | The specific subscription object in Stripe                           |
| status               | SubStatus enum | Current payment status                                               |
| currentPeriodEnd     | DateTime       | When the current billing period ends — check this for feature gating |
| createdAt            | DateTime       | When they first subscribed                                           |
| updatedAt            | DateTime       | Last time status changed                                             |

**SubStatus enum:** ACTIVE, CANCELLED, PAST_DUE, TRIALING

---

## Future Features

All deferred features with full design notes are captured in Jira:

- VIVI-56 — Story Mode, Multiplayer, Playlists, Character Invites
- VIVI-57 — Autonomous Character Agents Living Inside Vivia

---

## Background Jobs Summary

| Job                      | Schedule            | What it does                                                                                                                                 |
| ------------------------ | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Generate character days  | Every morning       | Creates CharacterDailyLife row for each character, updates CharacterEmotionalState                                                           |
| Post-session compression | After every session | Updates CharacterMemory.lastConversationSummary, CharacterEmotionalState, UserMemory                                                         |
| Away message generator   | Every few hours     | Checks inactive users, generates AwayMessages from characters, pulls trending content                                                        |
| Weekly compression       | Every Sunday night  | Compresses CharacterMemory.bondSummary, updates UserMemory.summary, writes CoachReport and WeeklyDigest, deletes sessions older than 30 days |

---

_Schema designed during Sprint 1 planning — VIVI-12_
