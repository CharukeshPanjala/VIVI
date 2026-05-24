-- CreateEnum
CREATE TYPE "Level" AS ENUM ('A1_1', 'A1_2', 'A2_1', 'A2_2', 'B1_1', 'B1_2', 'B2_1', 'B2_2', 'C1_1', 'C1_2', 'C2_1', 'C2_2');

-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('FREE', 'PRO');

-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('SOLO', 'GROUP', 'STORY', 'WATCH_PARTY');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ASSISTANT');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('MINOR', 'NOTABLE', 'CRITICAL');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('CHAT', 'LESSON', 'MANUAL');

-- CreateEnum
CREATE TYPE "CardStatus" AS ENUM ('NEW', 'LEARNING', 'MASTERED');

-- CreateEnum
CREATE TYPE "NoteType" AS ENUM ('CHAT', 'LESSON');

-- CreateEnum
CREATE TYPE "SubStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'PAST_DUE', 'TRIALING');

-- CreateEnum
CREATE TYPE "XPReason" AS ENUM ('SESSION_COMPLETED', 'LESSON_COMPLETED', 'STREAK_BONUS', 'MILESTONE', 'VOCAB_MASTERED', 'PERFECT_SESSION');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('STREAK_REMINDER', 'LEVEL_UP', 'REVIEW_DUE', 'MILESTONE_REACHED', 'COACH_REPORT_READY', 'DIGEST_READY', 'ACHIEVEMENT_UNLOCKED');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('MISSING_YOU', 'WORLD_EVENT', 'NEWS', 'REDDIT', 'INSTAGRAM', 'FACEBOOK', 'X_TWITTER', 'TIKTOK', 'YOUTUBE', 'PODCAST', 'BOOK', 'MUSIC', 'SPORT', 'FOOD', 'TRAVEL', 'TECHNOLOGY', 'CULTURE', 'LANGUAGE_TIP', 'MEME', 'PERSONAL_THOUGHT', 'MOVIE_TV', 'WEATHER', 'MILESTONE_APPROACHING', 'RANDOM');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "nativeLanguage" TEXT NOT NULL DEFAULT 'en',
    "targetLanguage" TEXT NOT NULL DEFAULT 'de',
    "level" "Level" NOT NULL DEFAULT 'A1_1',
    "goals" TEXT[],
    "totalXP" INTEGER NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" TIMESTAMP(3),
    "tier" "Tier" NOT NULL DEFAULT 'FREE',
    "isSuperUser" BOOLEAN NOT NULL DEFAULT false,
    "stripeCustomerId" TEXT,
    "lastWatchedLessonId" TEXT,
    "lastWatchedAt" TIMESTAMP(3),
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "sessionType" "SessionType" NOT NULL DEFAULT 'SOLO',
    "topic" TEXT,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "summary" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "characterId" TEXT,
    "role" "Role" NOT NULL,
    "content" TEXT NOT NULL,
    "expression" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mistake" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "original" TEXT NOT NULL,
    "corrected" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "topic" TEXT,
    "severity" "Severity" NOT NULL DEFAULT 'NOTABLE',
    "practiced" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mistake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VocabCard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "exampleSentence" TEXT,
    "sourceType" "SourceType" NOT NULL DEFAULT 'CHAT',
    "sourceId" TEXT,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "easinessFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "nextReviewDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "CardStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VocabCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "videoTitle" TEXT NOT NULL,
    "thumbnail" TEXT,
    "summary" TEXT[],
    "vocabWords" JSONB NOT NULL,
    "grammarPoints" TEXT[],
    "questions" JSONB NOT NULL,
    "level" "Level" NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'de',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLesson" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "watchedSeconds" INTEGER NOT NULL DEFAULT 0,
    "duration" INTEGER,
    "vocabExtracted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NoteType" NOT NULL,
    "lessonId" TEXT,
    "sessionId" TEXT,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserMemory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "personalDetails" JSONB NOT NULL DEFAULT '{}',
    "milestones" JSONB NOT NULL DEFAULT '[]',
    "learningStyle" TEXT,
    "motivations" TEXT[],
    "personality" TEXT,
    "struggles" TEXT[],
    "strengths" TEXT[],
    "currentFocus" TEXT,
    "lifeContext" JSONB NOT NULL DEFAULT '{}',
    "interests" TEXT[],
    "emotionalPatterns" TEXT,
    "languageAnxiety" TEXT,
    "communicationStyle" TEXT,
    "practicePattern" TEXT,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserMemory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterMemory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "bondLevel" INTEGER NOT NULL DEFAULT 1,
    "bondSummary" TEXT,
    "lastConversationSummary" TEXT,
    "firstMeetMemory" TEXT,
    "insideJokes" TEXT[],
    "memorableMoments" TEXT[],
    "currentEmotion" TEXT,
    "currentEmotionReason" TEXT,
    "characterOpinionOfUser" TEXT,
    "currentWorry" TEXT,
    "currentPride" TEXT,
    "sharedTopics" TEXT[],
    "relationshipStage" TEXT,
    "howCharacterTalksToUser" TEXT,
    "unspokenThings" TEXT,
    "growthWitnessed" TEXT[],
    "rituals" TEXT[],
    "missYouThreshold" INTEGER NOT NULL DEFAULT 3,
    "characterMood" TEXT,
    "lastGift" TEXT,
    "protectiveLevel" INTEGER NOT NULL DEFAULT 5,
    "lastSeenAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterMemory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterEmotionalState" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "currentEmotion" TEXT,
    "emotionReason" TEXT,
    "personalityRead" TEXT,
    "currentWorry" TEXT,
    "currentPride" TEXT,
    "energyLevel" TEXT,
    "hopeForNextSession" TEXT,
    "disappointment" TEXT,
    "excitementLevel" INTEGER NOT NULL DEFAULT 5,
    "missYouMessage" TEXT,
    "lastEmotionUpdate" TEXT,
    "emotionHistory" JSONB NOT NULL DEFAULT '[]',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterEmotionalState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterDailyLife" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "mood" TEXT NOT NULL,
    "moodReason" TEXT NOT NULL,
    "morningActivity" TEXT,
    "afternoonActivity" TEXT,
    "eveningActivity" TEXT,
    "highlight" TEXT NOT NULL,
    "thought" TEXT,
    "characterInteraction" TEXT,
    "worldEvent" TEXT,
    "weather" TEXT,
    "lessonLearned" TEXT,
    "recommendation" TEXT,
    "weekendPlan" TEXT,
    "upcomingEvent" TEXT,
    "longTermPlan" TEXT,
    "currentGoal" TEXT,
    "excitement" TEXT,
    "concern" TEXT,
    "recentTravel" TEXT,
    "tradition" TEXT,
    "yearEndPlan" TEXT,
    "currentObsession" TEXT,

    CONSTRAINT "CharacterDailyLife_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AwayMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "messageType" "MessageType" NOT NULL,
    "platform" TEXT,
    "contentCategory" TEXT,
    "mediaUrl" TEXT,
    "mediaTitle" TEXT,
    "trendingScore" INTEGER,
    "isRandom" BOOLEAN NOT NULL DEFAULT false,
    "emotion" TEXT,
    "requiresResponse" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "trigger" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "AwayMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachReport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekSummary" TEXT NOT NULL,
    "strongPoints" TEXT[],
    "focusAreas" TEXT[],
    "mistakePatterns" JSONB NOT NULL DEFAULT '{}',
    "recommendedLesson" TEXT,
    "mistakeToFix" TEXT,
    "motivationalNote" TEXT NOT NULL,
    "honestFeedback" TEXT NOT NULL,
    "xpThisWeek" INTEGER NOT NULL,
    "sessionsThisWeek" INTEGER NOT NULL,
    "streakStatus" TEXT NOT NULL,
    "nextWeekGoal" TEXT NOT NULL,
    "levelProgress" TEXT,
    "bestSession" TEXT,
    "hardestMoment" TEXT,
    "comparedToLastWeek" TEXT,
    "characterInsights" JSONB NOT NULL DEFAULT '{}',
    "realWorldChallenge" TEXT,
    "podcastRecommendation" TEXT,
    "grammarFocus" TEXT,
    "celebrationMoment" TEXT,
    "progressChart" JSONB NOT NULL DEFAULT '{}',
    "vocabularyStats" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "CoachReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyDigest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "daysActive" INTEGER NOT NULL,
    "xpEarned" INTEGER NOT NULL,
    "wordsLearned" INTEGER NOT NULL,
    "vocabMastered" INTEGER NOT NULL,
    "sessionCount" INTEGER NOT NULL,
    "totalTimeSpent" INTEGER NOT NULL,
    "averageSessionLength" INTEGER NOT NULL,
    "topCharacter" TEXT,
    "longestSession" INTEGER,
    "bestDay" TEXT,
    "bestTimeOfDay" TEXT,
    "streakStatus" TEXT,
    "mistakesFixed" INTEGER NOT NULL DEFAULT 0,
    "characterMessages" JSONB NOT NULL DEFAULT '{}',
    "weekHighlight" TEXT,
    "personalityInsight" TEXT,
    "weekRating" TEXT,
    "globalRank" TEXT,
    "improvedSkills" TEXT[],
    "funFact" TEXT,
    "nextMilestone" TEXT,
    "quote" TEXT,
    "nextWeekPreview" TEXT,
    "characterNote" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "WeeklyDigest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "XPTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" "XPReason" NOT NULL,
    "sourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "XPTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT NOT NULL,
    "status" "SubStatus" NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserLesson_userId_lessonId_key" ON "UserLesson"("userId", "lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "UserMemory_userId_key" ON "UserMemory"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterMemory_userId_characterId_key" ON "CharacterMemory"("userId", "characterId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterEmotionalState_userId_characterId_key" ON "CharacterEmotionalState"("userId", "characterId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterDailyLife_characterId_date_key" ON "CharacterDailyLife"("characterId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeCustomerId_key" ON "Subscription"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mistake" ADD CONSTRAINT "Mistake_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mistake" ADD CONSTRAINT "Mistake_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VocabCard" ADD CONSTRAINT "VocabCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLesson" ADD CONSTRAINT "UserLesson_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLesson" ADD CONSTRAINT "UserLesson_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMemory" ADD CONSTRAINT "UserMemory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterMemory" ADD CONSTRAINT "CharacterMemory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterEmotionalState" ADD CONSTRAINT "CharacterEmotionalState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AwayMessage" ADD CONSTRAINT "AwayMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachReport" ADD CONSTRAINT "CoachReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyDigest" ADD CONSTRAINT "WeeklyDigest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "XPTransaction" ADD CONSTRAINT "XPTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
