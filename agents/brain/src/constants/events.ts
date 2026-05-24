// ============================================================
// WORLD EVENTS CONSTANTS
// Seasonal triggers, character birthdays, calendar events.
// Derived from docs/WORLD_BIBLE.md Part 11
// ============================================================

import type { CharacterId } from './characters'

export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

export interface WorldEvent {
  id: string
  name: string
  month: number          // 1-12
  day?: number           // if specific date
  endMonth?: number      // for multi-month events
  characters: CharacterId[]
  description: string
  seasonalMood: string   // injected into character daily life during this period
  isRecurring: boolean
}

// ============================================================
// SEASONS
// ============================================================

export const SEASONS: Record<Season, { months: number[]; mood: string }> = {
  spring: {
    months: [3, 4, 5],
    mood: 'hopeful, park sessions, new energy, characters are lighter',
  },
  summer: {
    months: [6, 7, 8],
    mood: 'warm, Biergarten open, Max unbearable with excitement, long evenings',
  },
  autumn: {
    months: [9, 10, 11],
    mood: 'cosy, leaves falling, café sessions, slightly melancholic, reflective',
  },
  winter: {
    months: [12, 1, 2],
    mood: 'intimate, Weihnachtsmarkt, emotional, the most personal time of year',
  },
}

export function getCurrentSeason(month: number): Season {
  for (const [season, config] of Object.entries(SEASONS)) {
    if (config.months.includes(month)) return season as Season
  }
  return 'winter'
}

// ============================================================
// CHARACTER BIRTHDAYS
// ============================================================

export const CHARACTER_BIRTHDAYS: Record<CharacterId, { month: number; day: number } | null> = {
  anna: { month: 3, day: 15 },
  max: { month: 7, day: 3 },
  luna: { month: 11, day: 22 },
  finn: { month: 9, day: 8 },
  marco: { month: 5, day: 20 },
  yuki: { month: 2, day: 14 },
  mia: { month: 8, day: 11 },
  helga: { month: 10, day: 5 },
  weber: { month: 6, day: 30 },
  zara: { month: 4, day: 17 },
  djkai: { month: 1, day: 9 },
  sophie: { month: 7, day: 28 },
  klaus: null, // ageless
  hans: null,
}

export function isBirthday(characterId: CharacterId, month: number, day: number): boolean {
  const birthday = CHARACTER_BIRTHDAYS[characterId]
  if (!birthday) return false
  return birthday.month === month && birthday.day === day
}

// ============================================================
// WORLD EVENTS CALENDAR
// ============================================================

export const WORLD_EVENTS: WorldEvent[] = [
  {
    id: 'new_year',
    name: 'New Year',
    month: 1,
    day: 1,
    characters: ['anna', 'max', 'luna', 'finn'],
    description: 'Characters reflect on the journey. Personal messages about growth.',
    seasonalMood: 'reflective, hopeful, quietly emotional',
    isRecurring: true,
  },
  {
    id: 'valentines',
    name: "Valentine's Day",
    month: 2,
    day: 14,
    characters: ['max', 'luna'],
    description: 'Max and Luna tension. Unresolved things surface briefly.',
    seasonalMood: 'charged, slightly awkward for Max and Luna',
    isRecurring: true,
  },
  {
    id: 'anna_birthday',
    name: "Anna's Birthday",
    month: 3,
    day: 15,
    characters: ['anna', 'max', 'luna', 'finn'],
    description: 'Anna\'s birthday. Special scene. Bonus XP for logging in.',
    seasonalMood: 'warm, slightly vulnerable for Anna — she doesn\'t like fuss but secretly loves it',
    isRecurring: true,
  },
  {
    id: 'spring_begins',
    name: 'Spring in Vivia',
    month: 4,
    characters: ['anna', 'max', 'luna', 'finn'],
    description: 'Park sessions begin. Characters are lighter. Stadtpark unlocks.',
    seasonalMood: 'hopeful, energetic, everything feels more possible',
    isRecurring: true,
  },
  {
    id: 'max_startup',
    name: "Max's Startup Launch",
    month: 6,
    characters: ['max'],
    description: 'Max\'s current startup hits a milestone. He\'s unusually earnest about it.',
    seasonalMood: 'nervous excitement, trying to play it cool, clearly not playing it cool',
    isRecurring: false,
  },
  {
    id: 'finn_considers_leaving',
    name: 'Finn Almost Leaves',
    month: 8,
    characters: ['finn', 'anna'],
    description: 'Annual crisis. Finn books a flight and cancels it. Anna knows. Doesn\'t say.',
    seasonalMood: 'restless, slightly unsettled, Finn is more quiet than usual',
    isRecurring: true,
  },
  {
    id: 'oktoberfest',
    name: 'Oktoberfest',
    month: 9,
    endMonth: 10,
    characters: ['max', 'hans'],
    description: 'Hans arrives. Max is in his natural habitat. Luna cannot understand a word Hans says.',
    seasonalMood: 'loud, celebratory, Bayern references at maximum intensity',
    isRecurring: true,
  },
  {
    id: 'halloween_finn',
    name: "Finn's Ghost Story Night",
    month: 10,
    day: 31,
    characters: ['finn'],
    description: 'Finn tells a ghost story scenario. The most atmospheric session of the year.',
    seasonalMood: 'atmospheric, slightly eerie, Finn is in full storyteller mode',
    isRecurring: true,
  },
  {
    id: 'luna_phd_presentation',
    name: "Luna's PhD Presentation",
    month: 11,
    characters: ['luna', 'anna'],
    description: 'Luna is preparing her PhD chapter presentation. She needs to practice. The dynamic shifts.',
    seasonalMood: 'focused, slightly stressed for Luna, rare vulnerability',
    isRecurring: false,
  },
  {
    id: 'first_snow',
    name: 'First Snow — Klaus Arrives',
    month: 12,
    day: 1,
    characters: ['anna', 'max', 'luna', 'finn', 'klaus'],
    description: 'First snow of winter. Klaus arrives. The Weihnachtsmarkt opens. The most emotional month.',
    seasonalMood: 'warm, intimate, slightly magical, characters become softer',
    isRecurring: true,
  },
  {
    id: 'new_years_eve',
    name: "New Year's Eve — Language Anniversary",
    month: 12,
    day: 31,
    characters: ['anna', 'max', 'luna', 'finn'],
    description: "Bobby's language anniversary. How far since the first session. The group reflects together.",
    seasonalMood: 'deeply reflective, celebratory, the most personal message of the year',
    isRecurring: true,
  },
]

// ============================================================
// HELPERS
// ============================================================

export function getActiveEvents(month: number, day: number): WorldEvent[] {
  return WORLD_EVENTS.filter(event => {
    if (event.day) {
      // specific date event
      return event.month === month && event.day === day
    }
    if (event.endMonth) {
      // multi-month event
      return month >= event.month && month <= event.endMonth
    }
    // month-long event
    return event.month === month
  })
}

export function getUpcomingEvents(month: number, day: number, withinDays = 7): WorldEvent[] {
  // Simple check: events in the current or next month
  return WORLD_EVENTS.filter(event => {
    if (!event.day) return false
    const eventDate = new Date(2000, event.month - 1, event.day)
    const checkDate = new Date(2000, month - 1, day)
    const diff = (eventDate.getTime() - checkDate.getTime()) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= withinDays
  })
}

export function getSeasonalContext(month: number): string {
  const season = getCurrentSeason(month)
  return SEASONS[season].mood
}
