// ============================================================
// CHARACTER CONSTANTS
// Source of truth for character roster, unlock conditions,
// expressions, and rarity. Derived from docs/WORLD_BIBLE.md.
// ============================================================

export type CharacterId =
  | 'anna'
  | 'max'
  | 'luna'
  | 'finn'
  | 'marco'
  | 'yuki'
  | 'mia'
  | 'helga'
  | 'weber'
  | 'zara'
  | 'djkai'
  | 'sophie'
  | 'klaus'
  | 'hans'

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary'

export type UnlockCondition =
  | { type: 'default' }
  | { type: 'xp'; threshold: number }
  | { type: 'achievement'; achievementId: string }
  | { type: 'pro' }
  | { type: 'pro_and_xp'; threshold: number }
  | { type: 'pro_and_lessons'; count: number }
  | { type: 'seasonal'; month: number } // 1-12

export type Expression =
  | 'warm'
  | 'worried'
  | 'proud'
  | 'laughing'
  | 'reflective'
  | 'hype'
  | 'defensive'
  | 'cool'
  | 'dramatic'
  | 'soft'
  | 'neutral'
  | 'correcting'
  | 'satisfied'
  | 'surprised'
  | 'rare_warmth'
  | 'excited'
  | 'thinking'
  | 'mysterious'
  | 'storytelling'

export interface CharacterConfig {
  id: CharacterId
  name: string
  age: number
  role: string
  tagline: string
  rarity: Rarity
  unlock: UnlockCondition
  expressions: Expression[]
  defaultExpression: Expression
  birthday?: { month: number; day: number }
  district: string
  teaser: string // shown to users before unlock
}

// ============================================================
// CORE FOUR
// ============================================================

export const ANNA: CharacterConfig = {
  id: 'anna',
  name: 'Anna',
  age: 24,
  role: 'The Mentor',
  tagline: 'She knows what it feels like to be where you are.',
  rarity: 'common',
  unlock: { type: 'default' },
  expressions: ['warm', 'worried', 'proud', 'laughing', 'reflective'],
  defaultExpression: 'warm',
  birthday: { month: 3, day: 15 },
  district: 'Kreuzberg',
  teaser: 'Your first friend in Vivia. She moved here alone at 18 and never looked back.',
}

export const MAX: CharacterConfig = {
  id: 'max',
  name: 'Max',
  age: 25,
  role: 'The Street Teacher',
  tagline: 'Real German. The kind nobody teaches in class.',
  rarity: 'common',
  unlock: { type: 'xp', threshold: 500 },
  expressions: ['hype', 'defensive', 'cool', 'dramatic', 'soft'],
  defaultExpression: 'hype',
  birthday: { month: 7, day: 3 },
  district: 'Schwabing',
  teaser: 'From Munich. Loud. Has a dog named Wurst. Will not stop talking about Bayern.',
}

export const LUNA: CharacterConfig = {
  id: 'luna',
  name: 'Luna',
  age: 23,
  role: 'The Professor',
  tagline: 'She only corrects people she believes in.',
  rarity: 'common',
  unlock: { type: 'xp', threshold: 1200 },
  expressions: ['neutral', 'correcting', 'satisfied', 'surprised', 'rare_warmth'],
  defaultExpression: 'neutral',
  birthday: { month: 11, day: 22 },
  district: 'Innere Stadt',
  teaser: 'PhD student from Vienna. Precise. High standards. When she says "perfect" — she means it.',
}

export const FINN: CharacterConfig = {
  id: 'finn',
  name: 'Finn',
  age: 26,
  role: 'The Adventurer',
  tagline: 'Language is alive in the world. He\'ll show you.',
  rarity: 'common',
  unlock: { type: 'xp', threshold: 2500 },
  expressions: ['excited', 'thinking', 'mysterious', 'storytelling', 'warm'],
  defaultExpression: 'excited',
  birthday: { month: 9, day: 8 },
  district: 'Hafenviertel',
  teaser: 'Travel writer. Speaks 6 languages. Has been to 43 countries. Currently "staying for a bit."',
}

// ============================================================
// RARE CHARACTERS
// ============================================================

export const MARCO: CharacterConfig = {
  id: 'marco',
  name: 'Marco',
  age: 32,
  role: 'The Chaos Teacher',
  tagline: 'German is his third language. It shows. He doesn\'t care.',
  rarity: 'rare',
  unlock: { type: 'achievement', achievementId: 'lessons_10_streak' },
  expressions: ['excited', 'laughing', 'dramatic', 'warm'],
  defaultExpression: 'excited',
  district: 'Mitte',
  teaser: 'Italian chef. Teaches German through food disasters. Max loves him. Luna is horrified.',
}

export const YUKI: CharacterConfig = {
  id: 'yuki',
  name: 'Yuki',
  age: 21,
  role: 'The Fellow Learner',
  tagline: 'Same level as you. Same mistakes. You\'re not alone.',
  rarity: 'rare',
  unlock: { type: 'achievement', achievementId: 'cards_reviewed_100' },
  expressions: ['excited', 'worried', 'laughing', 'warm'],
  defaultExpression: 'warm',
  district: 'Mitte',
  teaser: 'From Tokyo, on exchange. Learning German at exactly your level. The solidarity is real.',
}

export const MIA: CharacterConfig = {
  id: 'mia',
  name: 'Mia',
  age: 16,
  role: 'The Gen Z Translator',
  tagline: 'How young Germans actually talk.',
  rarity: 'rare',
  unlock: { type: 'achievement', achievementId: 'streak_7_days' },
  expressions: ['cool', 'laughing', 'dramatic', 'neutral'],
  defaultExpression: 'cool',
  district: 'Kreuzberg',
  teaser: 'Born in Vivia. Makes the core four feel ancient. Teaches the German nobody puts in textbooks.',
}

export const HELGA: CharacterConfig = {
  id: 'helga',
  name: 'Oma Helga',
  age: 72,
  role: 'The Grandmother',
  tagline: 'Infinitely patient. Virtually bakes. Everyone loves her.',
  rarity: 'rare',
  unlock: { type: 'achievement', achievementId: 'level_a1_complete' },
  expressions: ['warm', 'proud', 'laughing', 'reflective'],
  defaultExpression: 'warm',
  district: 'Mitte',
  teaser: 'Retired teacher. Makes Apfelkuchen. Even Luna becomes soft around Helga.',
}

// ============================================================
// EPIC CHARACTERS (Pro only)
// ============================================================

export const WEBER: CharacterConfig = {
  id: 'weber',
  name: 'Prof. Weber',
  age: 68,
  role: 'The Legend',
  tagline: 'Has forgotten more German grammar than most people ever learn.',
  rarity: 'epic',
  unlock: { type: 'pro_and_xp', threshold: 5000 },
  expressions: ['neutral', 'correcting', 'thinking', 'satisfied'],
  defaultExpression: 'neutral',
  district: 'Mitte',
  teaser: 'Luna\'s mentor. Retired linguistics professor. His compliments are earned in blood and worth everything.',
}

export const ZARA: CharacterConfig = {
  id: 'zara',
  name: 'Zara',
  age: 27,
  role: 'The Real Berlin',
  tagline: 'What real Berliners actually speak.',
  rarity: 'epic',
  unlock: { type: 'pro' },
  expressions: ['cool', 'warm', 'laughing', 'excited'],
  defaultExpression: 'cool',
  district: 'Kreuzberg',
  teaser: 'Turkish-German, born in Vivia. Code-switches naturally. Not Luna\'s textbook German — real Berlin German.',
}

export const DJKAI: CharacterConfig = {
  id: 'djkai',
  name: 'DJ Kai',
  age: 28,
  role: 'The Night',
  tagline: 'Techno. Kultur. Das echte Berlin.',
  rarity: 'epic',
  unlock: { type: 'pro' },
  expressions: ['cool', 'excited', 'mysterious', 'hype'],
  defaultExpression: 'cool',
  district: 'Mitte',
  teaser: 'Berlin underground. Electronic music producer. The German of clubs, culture, and late nights.',
}

export const SOPHIE: CharacterConfig = {
  id: 'sophie',
  name: 'Sophie',
  age: 31,
  role: 'The Professional',
  tagline: 'You want to work in Germany? Then write it.',
  rarity: 'epic',
  unlock: { type: 'pro_and_lessons', count: 20 },
  expressions: ['neutral', 'correcting', 'satisfied', 'thinking'],
  defaultExpression: 'neutral',
  district: 'Mitte',
  teaser: 'Frankfurt journalist. Teaches formal written German and professional register.',
}

// ============================================================
// LEGENDARY CHARACTERS (Seasonal)
// ============================================================

export const KLAUS: CharacterConfig = {
  id: 'klaus',
  name: 'Klaus',
  age: 0, // ageless
  role: 'The Christmas Spirit',
  tagline: 'December only. Magic.',
  rarity: 'legendary',
  unlock: { type: 'seasonal', month: 12 },
  expressions: ['excited', 'warm', 'laughing', 'hype'],
  defaultExpression: 'excited',
  district: 'Mitte',
  teaser: 'Only appears in December. The whole group goes chaotic. Luna wears a Santa hat.',
}

export const HANS: CharacterConfig = {
  id: 'hans',
  name: 'Hans',
  age: 45,
  role: 'The Bavarian',
  tagline: 'Pure dialect. Even Max struggles.',
  rarity: 'legendary',
  unlock: { type: 'seasonal', month: 9 },
  expressions: ['hype', 'laughing', 'excited', 'warm'],
  defaultExpression: 'hype',
  district: 'Schwabing',
  teaser: 'September and October only. Oktoberfest energy. Max is obsessed. Luna cannot understand a word.',
}

// ============================================================
// FULL ROSTER
// ============================================================

export const ALL_CHARACTERS: CharacterConfig[] = [
  ANNA, MAX, LUNA, FINN,
  MARCO, YUKI, MIA, HELGA,
  WEBER, ZARA, DJKAI, SOPHIE,
  KLAUS, HANS,
]

export const CHARACTER_MAP: Record<CharacterId, CharacterConfig> = {
  anna: ANNA,
  max: MAX,
  luna: LUNA,
  finn: FINN,
  marco: MARCO,
  yuki: YUKI,
  mia: MIA,
  helga: HELGA,
  weber: WEBER,
  zara: ZARA,
  djkai: DJKAI,
  sophie: SOPHIE,
  klaus: KLAUS,
  hans: HANS,
}

// ============================================================
// HELPERS
// ============================================================

export function getCharacter(id: CharacterId): CharacterConfig {
  return CHARACTER_MAP[id]
}

export function isUnlocked(
  character: CharacterConfig,
  userXP: number,
  isPro: boolean,
  currentMonth: number,
  achievements: string[]
): boolean {
  const { unlock } = character

  switch (unlock.type) {
    case 'default':
      return true
    case 'xp':
      return userXP >= unlock.threshold
    case 'achievement':
      return achievements.includes(unlock.achievementId)
    case 'pro':
      return isPro
    case 'pro_and_xp':
      return isPro && userXP >= unlock.threshold
    case 'pro_and_lessons':
      // lesson count checked separately
      return isPro
    case 'seasonal':
      return currentMonth === unlock.month
    default:
      return false
  }
}

export function getUnlockedCharacters(
  userXP: number,
  isPro: boolean,
  currentMonth: number,
  achievements: string[]
): CharacterConfig[] {
  return ALL_CHARACTERS.filter(c =>
    isUnlocked(c, userXP, isPro, currentMonth, achievements)
  )
}
