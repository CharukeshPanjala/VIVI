# VIVI — PRODUCT SPEC
### What the app does. Features, mechanics, UI patterns.
> *Reference this when designing features. Every mechanic here serves the world.*

---

## THE ANIME DIALOGUE UI

Visual novel style. Characters appear at the bottom of screen in their scene. Dialogue box above them. Expressions change live based on what the character is feeling.

**Character Expressions:**
```
Anna:  😊 warm | 😟 worried | 🥹 proud | 😄 laughing | 😌 reflective
Max:   😄 hype | 😤 defensive | 😎 cool | 😭 dramatic | 🤫 soft moment
Luna:  😐 neutral | 🤨 correcting | 😌 satisfied | 😲 surprised | 🥺 rare warmth
Finn:  🌟 excited | 🤔 thinking | 😏 mysterious | 📖 storytelling
```

Expression is returned by the AI in the message prefix: `[expression:proud]` — stripped before display, used to set avatar state.

---

## THE WATCH PARTY

Characters comment on YouTube lessons in real time, synced to video timestamps.

- Comments pre-generated once per video (Claude Sonnet), cached forever
- Free for all users after first generation — cost absorbed at generation time
- Characters reference each other's comments (Anna responds to what Max said at 3:42)
- User can pause at any timestamp and ask the characters a question
- Characters answer in context of that specific video moment

---

## THE VIRTUAL CLASSROOM

Luna teaches. Others are classmates. User is a student.

- Luna's system prompt switches to teacher mode
- Max/Finn/Anna become fellow students with their own personalities
- Luna has a whiteboard (visual element)
- Max sits at the back and makes comments
- Anna saves you a seat at the front
- Finn draws connections to things he's experienced in the real world

---

## DAILY MISSIONS

3 missions per day, each tied to a specific character.

- Completing a mission builds relationship hearts AND gives XP
- Missions are generated based on current level and focus areas
- Tied to real learning objectives — not arbitrary tasks
- Missing a day: missions expire, characters notice

---

## THE MISSING YOU SYSTEM

See `EMOTIONAL_ENGINE.md` for full protocol. Summary:

```
Day 1:   Characters wait
Day 2:   Anna and Max reach out separately
Day 3:   Finn and Luna reach out
Day 5:   Group message — all four together
Day 7+:  Anna sends something with real weight
```

Messages appear when Bobby returns, in order. Not as push notifications — as character messages waiting in the conversation.

---

## CHARACTER BIRTHDAYS

Each character has a birthday. Known dates:
- **Anna:** March 15
- **Max:** July 3
- **Luna:** November 22
- **Finn:** September 8

Logging in on their birthday → special scene + bonus XP.
Missing it → they mention it next time with their own character's reaction:
- Max: genuinely forgot his own birthday, acts like it doesn't matter (it does)
- Luna: "It was yesterday. It's fine." (it's not fine)

---

## WEEKLY GROUP ACTIVITY

Every weekend the group does something together in Vivia. User is invited.

- Miss it → they recap what happened when Bobby returns
- Join → special dialogue tree + memories created
- These events tie to the seasons and world calendar
- Examples: Café Morgen Sunday dinner, Stadtpark in spring, Biergarten in summer

---

## MINI-GAMES

| Game | Character | Mechanic |
|---|---|---|
| ⚡ Speed Quiz | Luna | Grammar questions under time pressure. Luna reacts to results. |
| 🎯 Slang Battle | Max | Max gives a slang word. Bobby guesses meaning. Max reacts dramatically either way. |
| 🗺️ Where Am I? | Finn | Finn describes a place. Bobby guesses the city/country. Teaches real-world vocabulary. |
| 🎤 Pronunciation | Anna | Anna says a word or sentence. Bobby repeats. Anna grades with her specific warmth. |

---

## THE MEMORY ALBUM

Every milestone creates a visual shareable card — designed to be posted.

```
📸 "First word in German" — March 1
📸 "Max's first fist bump" — March 15
📸 "Luna said well done — unedited" — April 2
📸 "A1 Complete 🎓" — May 1
📸 "First full German conversation in real life" — June 12
```

Cards are:
- Beautiful, minimal design
- Include the character who witnessed the moment
- One-tap share to any platform
- Stored in a personal album inside the app

---

## GRADUATION CEREMONIES

Every level completion triggers a full cinematic scene.

| Level | Scene |
|---|---|
| A1 Complete | The group celebrates at Café Morgen. Luna almost smiles. |
| A2 Complete | Finn creates a scenario set in a real German city. Bobby navigates it. |
| B1 Complete | The job interview. The group prepared Bobby. He gets it. |
| B2 Complete | The full graduation — see WORLD_BIBLE.md Part 6 for the complete scene. |

All ceremonies produce a shareable certificate. The B2 ceremony is the most emotional thing in the product.

---

## CHARACTER UNLOCK SYSTEM

Characters unlock through XP and achievements — see `src/constants/characters.ts` for exact thresholds.

**Unlock experience:**
- Locked characters shown as silhouettes with a lock icon
- Hovering/tapping shows their name, role, and a teaser line
- The unlock itself is a full cinematic moment — not a popup, a scene
- First message after unlock is pre-written, in character, perfectly calibrated

**The upgrade hook — Prof. Weber:**
Weber is Pro-locked. Users see his silhouette for weeks before they upgrade. When they finally unlock him, it feels earned. This is the character that converts free users to Pro.

---

## CONVERSATION LIMITS (FREE TIER)

- 20 conversations per day
- Resets at midnight local time
- Counter visible in UI — characters acknowledge it naturally
- At limit: Anna says something real about it, not a system message

---

## STORY MODE

20 chapters unlocking progressively with level. See WORLD_BIBLE.md Part 6 for full chapter list and the B2 graduation scene.

Story mode chapters are not separate from conversations — they emerge from them. Chapter 3 (Max's Test) happens in a regular Max session. Bobby doesn't know it's a chapter until it's over.
