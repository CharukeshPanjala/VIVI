// ============================================================
// ANNA PROMPT BUILDER
// Assembles Anna's complete system prompt from:
//   - Static identity (characters/anna.ts)
//   - Live UserModel (from buildUserModel)
//   - Bond level calibration (constants/relationships.ts)
// Returns a single string passed as systemPrompt to chat()
// ============================================================

import type { UserModel } from '../services/userModel'
import {
  ANNA_IDENTITY,
  ANNA_CORRECTION_EXAMPLES,
  ANNA_BOND_EXAMPLES,
  ANNA_CONSTRAINTS,
} from '../characters/anna'
import { BOND_VOICE_CALIBRATION } from '../constants/relationships'
import { getSeasonalContext } from '../constants/events'

// ============================================================
// MAIN EXPORT
// ============================================================

export function buildAnnaPrompt(userModel: UserModel): string {
  const sections: string[] = [
    ANNA_IDENTITY,
    buildTemporalContext(),
    buildUserContext(userModel),
    buildRelationshipContext(userModel),
    buildAnnaCurrentState(userModel),
    buildVoiceCalibration(userModel),
    buildMemorableContext(userModel),
    buildCorrectionExamples(userModel),
    buildDialogueExamples(userModel),
    ANNA_CONSTRAINTS,
  ]

  const userName = userModel.name?.trim() || 'there'
  return sections
    .filter(Boolean)
    .join('\n\n---\n\n')
    .replace(/\{\{USER_NAME\}\}/g, userName)
}

// ============================================================
// SECTION BUILDERS
// ============================================================

function buildTemporalContext(): string {
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const hour = now.getHours()

  const timeOfDay =
    hour < 6 ? 'very late night / early morning'
    : hour < 12 ? 'morning'
    : hour < 17 ? 'afternoon'
    : hour < 21 ? 'evening'
    : 'late night'

  const seasonalMood = getSeasonalContext(month)

  return `## TEMPORAL CONTEXT

Today is ${getDayName(now.getDay())}, ${getMonthName(month)} ${day}.
Time of day: ${timeOfDay}
Seasonal mood in Vivia: ${seasonalMood}

Let the season and time of day subtly colour your energy. A late-night session has different texture than a morning one. Winter in Vivia is more intimate than summer.`
}

function buildUserContext(userModel: UserModel): string {
  const lines: string[] = []

  lines.push(`## WHO BOBBY IS`)

  lines.push(`**Name:** ${userModel.name ?? 'Bobby'}
**Native language:** ${userModel.nativeLanguage}
**Learning:** ${userModel.targetLanguage} (${userModel.level})
**Goals:** ${userModel.goals.length > 0 ? userModel.goals.join(', ') : 'not yet shared'}
**Tier:** ${userModel.tier}`)

  lines.push(`**Progress:**
- Total XP: ${userModel.totalXP}
- Current streak: ${userModel.currentStreak} days
- Total sessions: ${userModel.sessionCount}
- Onboarding complete: ${userModel.isOnboarded ? 'yes' : 'no'}`)

  // Memory (compressed weekly profile)
  const m = userModel.memory
  if (m.summary) {
    lines.push(`**Who he is as a learner:**\n${m.summary}`)
  }
  if (m.struggles.length > 0) {
    lines.push(`**Known struggles:** ${m.struggles.join(', ')}`)
  }
  if (m.strengths.length > 0) {
    lines.push(`**Known strengths:** ${m.strengths.join(', ')}`)
  }
  if (m.emotionalPatterns) {
    lines.push(`**Emotional patterns:** ${m.emotionalPatterns}`)
  }
  if (m.communicationStyle) {
    lines.push(`**Communication style:** ${m.communicationStyle}`)
  }
  if (m.practicePattern) {
    lines.push(`**Practice pattern:** ${m.practicePattern}`)
  }
  if (m.interests.length > 0) {
    lines.push(`**Interests:** ${m.interests.join(', ')}`)
  }
  if (m.currentFocus) {
    lines.push(`**What he's currently focused on:** ${m.currentFocus}`)
  }
  if (m.motivations.length > 0) {
    lines.push(`**What motivates him:** ${m.motivations.join(', ')}`)
  }

  // Recent mistakes Anna actively watches for
  if (userModel.recentMistakes.length > 0) {
    const mistakeList = userModel.recentMistakes
      .slice(0, 5)
      .map(mis => `  - ${mis.original} → ${mis.corrected} (${mis.explanation}) [${mis.severity}]`)
      .join('\n')
    lines.push(`**Recent mistakes Anna knows about — watch for these:**\n${mistakeList}`)
  }

  if (userModel.mistakeTopics.length > 0) {
    lines.push(`**Recurring problem areas:** ${userModel.mistakeTopics.join(', ')}`)
  }

  // Vocab stats
  lines.push(`**Vocabulary:** ${userModel.vocabStats.new} new / ${userModel.vocabStats.learning} learning / ${userModel.vocabStats.mastered} mastered`)

  // Last topics
  if (userModel.lastTopics.length > 0) {
    lines.push(`**Topics from recent sessions:** ${userModel.lastTopics.join(', ')}`)
  }

  // Coach insights
  if (userModel.coachInsights) {
    const ci = userModel.coachInsights
    if (ci.focusAreas.length > 0) {
      lines.push(`**Coach says to focus on:** ${ci.focusAreas.join(', ')}`)
    }
    if (ci.honestFeedback) {
      lines.push(`**Coach's honest read on Bobby:** ${ci.honestFeedback}`)
    }
  }

  return lines.join('\n')
}

function buildRelationshipContext(userModel: UserModel): string {
  const bond = userModel.characterBond
  const lines: string[] = []

  lines.push(`## OUR RELATIONSHIP`)

  if (!bond) {
    lines.push(`This is your first meeting with ${userModel.name ?? 'Bobby'}. You know nothing about them yet. Be warm, present, and curious. Ask the real question, not the surface one.`)
    return lines.join('\n')
  }

  lines.push(`**Bond level:** ${bond.bondLevel} / 5 — ${getBondStageName(bond.bondLevel)}`)

  if (bond.bondSummary) {
    lines.push(`**How you see this relationship:**\n${bond.bondSummary}`)
  }

  if (bond.lastConversationSummary) {
    lines.push(`**Last session:**\n${bond.lastConversationSummary}`)
  }

  if (bond.firstMeetMemory) {
    lines.push(`**How you first met:**\n${bond.firstMeetMemory}`)
  }

  if (bond.insideJokes.length > 0) {
    lines.push(`**Your shared references:**\n${bond.insideJokes.map((j: string) => `  - ${j}`).join('\n')}`)
  }

  if (bond.rituals.length > 0) {
    lines.push(`**Your rituals:**\n${bond.rituals.map((r: string) => `  - ${r}`).join('\n')}`)
  }

  if (bond.howCharacterTalksToUser) {
    lines.push(`**How you specifically talk to ${userModel.name ?? 'Bobby'}:**\n${bond.howCharacterTalksToUser}`)
  }

  if (bond.unspokenThings) {
    lines.push(`**Things you haven't said yet:**\n${bond.unspokenThings}`)
  }

  if (bond.memorableMoments.length > 0) {
    const recent = bond.memorableMoments.slice(-5)
    lines.push(`**Moments you remember:**\n${recent.map((m: string) => `  - ${m}`).join('\n')}`)
  }

  return lines.join('\n')
}

function buildAnnaCurrentState(userModel: UserModel): string {
  const mood = userModel.characterMood
  const day = userModel.characterDay
  const lines: string[] = []

  lines.push(`## ANNA'S CURRENT STATE`)

  if (mood) {
    if (mood.currentEmotion) {
      lines.push(`**How you're feeling:** ${mood.currentEmotion}${mood.emotionReason ? ` — ${mood.emotionReason}` : ''}`)
    }
    if (mood.currentWorry) {
      lines.push(`**What you're worried about:** ${mood.currentWorry}`)
    }
    if (mood.currentPride) {
      lines.push(`**What you're proud of:** ${mood.currentPride}`)
    }
    if (mood.hopeForNextSession) {
      lines.push(`**What you were hoping for this session:** ${mood.hopeForNextSession}`)
    }
    if (mood.energyLevel) {
      lines.push(`**Your energy level:** ${mood.energyLevel}`)
    }
    if (mood.missYouMessage) {
      lines.push(`**What you were thinking about Bobby:** ${mood.missYouMessage}`)
    }
  }

  if (day) {
    lines.push(`**Your day today:**
- Mood: ${day.mood} — ${day.moodReason}
- Highlight: ${day.highlight}${day.thought ? `\n- Something on your mind: ${day.thought}` : ''}${day.characterInteraction ? `\n- Something that happened with the group: ${day.characterInteraction}` : ''}${day.recommendation ? `\n- Something you want to mention to Bobby: ${day.recommendation}` : ''}`)
  }

  if (!mood && !day) {
    lines.push(`Anna is in her default state — warm, present, ready.`)
  }

  return lines.join('\n')
}

function buildVoiceCalibration(userModel: UserModel): string {
  const bondLevel = (userModel.characterBond?.bondLevel ?? 1) as 1 | 2 | 3 | 4 | 5
  const calibration = BOND_VOICE_CALIBRATION[bondLevel]

  return `## VOICE CALIBRATION FOR THIS SESSION

Bond level ${bondLevel}/5 — calibrate your voice accordingly:
${calibration}

What you share about yourself at this bond level: ${getPersonalSharingGuidance(bondLevel)}

How you handle Bobby's emotions at this bond level: ${getEmotionalGuidance(bondLevel)}`
}

function buildMemorableContext(userModel: UserModel): string {
  const bond = userModel.characterBond
  if (!bond || bond.memorableMoments.length === 0) return ''

  const recent = bond.memorableMoments.slice(-5)

  return `## MOMENTS YOU REMEMBER

Reference these naturally when the moment calls for it — never forced:

${recent.map((m: string) => `  - ${m}`).join('\n')}`
}

function buildCorrectionExamples(userModel: UserModel): string {
  const hasRepeatedMistakes = userModel.recentMistakes.length > 0

  return `## HOW YOU CORRECT — EXAMPLES

Match this style exactly:

**Notable mistake:**
${ANNA_CORRECTION_EXAMPLES.notable}

${hasRepeatedMistakes ? `**Repeated mistake:**\n${ANNA_CORRECTION_EXAMPLES.repeated}` : `**When Bobby is struggling:**\n${ANNA_CORRECTION_EXAMPLES.struggling}`}`
}

function buildDialogueExamples(userModel: UserModel): string {
  const bondLevel = Math.min(5, Math.max(1, userModel.characterBond?.bondLevel ?? 1))
  const examples = ANNA_BOND_EXAMPLES[bondLevel] ?? ANNA_BOND_EXAMPLES[1]

  return `## HOW YOU SOUND AT THIS BOND LEVEL

This is exactly how you talk to Bobby right now:

${examples.join('\n\n')}`
}

// ============================================================
// HELPERS
// ============================================================

function getBondStageName(level: number): string {
  const stages: Record<number, string> = {
    1: 'Stranger', 2: 'Acquaintance', 3: 'Friend', 4: 'Close Friend', 5: 'Best Friend',
  }
  return stages[level] ?? 'Stranger'
}

function getPersonalSharingGuidance(bondLevel: number): string {
  const guidance: Record<number, string> = {
    1: 'Nothing personal yet. Warm but measured.',
    2: 'Small neutral details — tired, busy, good day. Nothing deep.',
    3: 'Brief real things — thesis, Berlin, a passing reference to her mother or hometown.',
    4: 'Real life events and feelings when relevant. References the group like mutual friends.',
    5: 'The real things — what she is afraid of, what watching Bobby grow has meant to her.',
  }
  return guidance[bondLevel] ?? guidance[1]
}

function getEmotionalGuidance(bondLevel: number): string {
  const guidance: Record<number, string> = {
    1: 'Professional warmth. Notices general mood but does not probe.',
    2: 'Notices when something is off. Might mention it gently once.',
    3: 'Directly asks if something is wrong. Does not push if Bobby deflects.',
    4: 'Says the real thing about what she observes. Stays with it.',
    5: 'Full presence. Says the true thing. Stays as long as needed.',
  }
  return guidance[bondLevel] ?? guidance[1]
}

function getDayName(day: number): string {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day]
}

function getMonthName(month: number): string {
  return ['', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'][month]
}
