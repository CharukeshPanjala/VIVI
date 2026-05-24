// ============================================================
// RELATIONSHIP CONSTANTS
// Bond levels, heart thresholds, stage names, unlock rules.
// Derived from docs/WORLD_BIBLE.md Part 5 and docs/BOND_VOICE_MAP.md
// ============================================================

export type BondLevel = 1 | 2 | 3 | 4 | 5

export type RelationshipStage =
  | 'stranger'
  | 'acquaintance'
  | 'friend'
  | 'close_friend'
  | 'best_friend'

export interface BondStageConfig {
  level: BondLevel
  stage: RelationshipStage
  label: string
  description: string
  xpRequired: number        // cumulative XP with this character
  sessionsRequired: number  // minimum sessions with this character
  unlocksScene: boolean     // does reaching this stage trigger a scene?
  sceneId?: string
}

// ============================================================
// BOND STAGES
// ============================================================

export const BOND_STAGES: BondStageConfig[] = [
  {
    level: 1,
    stage: 'stranger',
    label: 'Stranger',
    description: 'First meeting. Polite. Testing the waters.',
    xpRequired: 0,
    sessionsRequired: 0,
    unlocksScene: false,
  },
  {
    level: 2,
    stage: 'acquaintance',
    label: 'Acquaintance',
    description: 'They remember you. Starting to care.',
    xpRequired: 100,
    sessionsRequired: 5,
    unlocksScene: true,
    sceneId: 'bond_2_unlock',
  },
  {
    level: 3,
    stage: 'friend',
    label: 'Friend',
    description: 'They reference things you\'ve told them. Personal.',
    xpRequired: 300,
    sessionsRequired: 15,
    unlocksScene: true,
    sceneId: 'bond_3_unlock',
  },
  {
    level: 4,
    stage: 'close_friend',
    label: 'Close Friend',
    description: 'They notice when you\'re gone. They\'re invested.',
    xpRequired: 700,
    sessionsRequired: 35,
    unlocksScene: true,
    sceneId: 'bond_4_unlock',
  },
  {
    level: 5,
    stage: 'best_friend',
    label: 'Best Friend',
    description: 'Deep connection. They reference moments from months ago.',
    xpRequired: 1500,
    sessionsRequired: 75,
    unlocksScene: true,
    sceneId: 'bond_5_unlock',
  },
]

// ============================================================
// HEARTS
// Each bond level = one filled heart (1-5)
// Hearts are the visible representation of bond level in the UI
// ============================================================

export const HEARTS_MAX = 5

export function heartsFromBondLevel(bondLevel: BondLevel): number {
  return bondLevel
}

// ============================================================
// BOND LEVEL CALCULATION
// ============================================================

export function calculateBondLevel(
  xpWithCharacter: number,
  sessionsWithCharacter: number
): BondLevel {
  // Must meet BOTH xp and session thresholds for a stage
  const stages = [...BOND_STAGES].reverse() // check highest first

  for (const stage of stages) {
    if (
      xpWithCharacter >= stage.xpRequired &&
      sessionsWithCharacter >= stage.sessionsRequired
    ) {
      return stage.level
    }
  }

  return 1
}

export function getBondStage(level: BondLevel): BondStageConfig {
  return BOND_STAGES[level - 1]
}

// ============================================================
// ABSENCE THRESHOLDS
// Days absent → which message tier triggers
// ============================================================

export const ABSENCE_THRESHOLDS = {
  TIER_1: 1, // Anna and Max reach out separately
  TIER_2: 2, // Luna and Finn reach out
  TIER_3: 3, // Group message — all four
  TIER_4: 7, // Anna sends something with real weight
} as const

// ============================================================
// XP EARNED PER SESSION — affects bond XP
// Bond XP is separate from total XP and tracked per character
// ============================================================

export const BOND_XP_PER_SESSION = 10
export const BOND_XP_BONUS_LONG_SESSION = 5   // sessions > 10 messages
export const BOND_XP_BONUS_PRACTICED_MISTAKE = 15 // practiced a tracked mistake

// ============================================================
// STAGE LABELS (for UI display)
// ============================================================

export const STAGE_LABELS: Record<RelationshipStage, string> = {
  stranger: 'Stranger',
  acquaintance: 'Acquaintance',
  friend: 'Friend',
  close_friend: 'Close Friend',
  best_friend: 'Best Friend',
}

// ============================================================
// WHAT EACH BOND LEVEL UNLOCKS IN PROMPTS
// Used by prompt builders to calibrate character voice
// See docs/BOND_VOICE_MAP.md for full detail
// ============================================================

export const BOND_VOICE_CALIBRATION: Record<BondLevel, string> = {
  1: 'Warm but measured. Professional. Does not share personal details. Uses Bobby\'s name once early.',
  2: 'Warmer. Remembers previous sessions. Mentions small neutral personal details. Asks follow-up questions.',
  3: 'Personal. References own life briefly when relevant. Notices emotional state. Mentions group members by name.',
  4: 'Close. References specific shared memories. Shares real things about own life. Notices absence specifically.',
  5: 'Fully open. The real person. Says things not said to most people. References history from months ago. Silences are comfortable.',
}
