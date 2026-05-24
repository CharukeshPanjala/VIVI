# MEMORY RULES
### What gets stored in character memory, what format, what persists, what fades.
> *Memory is what makes the characters feel like they know you. This document defines exactly how that works.*

---

## THE CORE PRINCIPLE

Real friends remember the specific things — not summaries, not categories, not metadata. They remember that you mentioned your neighbour's name once four months ago and asked about him later. They remember the exact sentence you said when you first got something right. They remember the look on your face (or the tone of your message) the day something was hard.

Vivi's memory system is built to store and surface the specific things, not the general things.

---

## MEMORY ARCHITECTURE

There are three layers of memory, each with different lifespans and purposes:

### Layer 1 — Session Memory (ephemeral)
The full conversation. Every message, both directions. Lives in the `Message` table.
- **Retention:** 30 days
- **After 30 days:** Compressed into Layer 2 and deleted
- **Used for:** Continuing a conversation, immediate context, same-session corrections

### Layer 2 — Character Memory (permanent, compressed)
The distilled essence of the relationship between one character and one user. Lives in `CharacterMemory`.
- **Retention:** Permanent
- **Updated:** Weekly compression job + after significant moments
- **Used for:** Every session. Injected into the system prompt.

### Layer 3 — User Memory (permanent, compressed)
Bobby's overall profile — who he is as a learner and as a person. Lives in `UserMemory`.
- **Retention:** Permanent
- **Updated:** Weekly compression job
- **Used for:** Every session for every character. The core identity layer.

---

## WHAT GETS STORED IN CHARACTER MEMORY

`CharacterMemory` is the most important table for making characters feel real. Here is exactly what goes into each field and why.

---

### `bondSummary`
A short paragraph written from the character's perspective about this relationship. Not clinical. Not a list. Written in the character's voice.

**Format:** 3-5 sentences. First person. Emotional. Specific.

**Example (Anna, bond level 3):**
> Bobby arrived uncertain and has grown steadily more confident. He makes the same Dativ errors but he always comes back, which tells me something about who he is. He mentioned once that he's trying to belong somewhere — I understood that more than I said. He has a good instinct for when something matters and a tendency to be too hard on himself when he makes mistakes. I'm invested in what happens to him.

**Updated:** After every 5 sessions, or after any significant emotional moment.

---

### `lastConversationSummary`
What happened in the most recent session. Specific. Including emotional texture, not just content.

**Format:** 3-4 sentences. What was worked on, what happened emotionally, anything noteworthy.

**Example:**
> Bobby came back after 8 days away and seemed lighter than I expected — he'd been trying German at work apparently, which is new. We worked on Konjunktiv II for the first time. He got frustrated mid-session and I had to ease off the drilling. He left in better shape than he arrived.

**Updated:** After every session.

---

### `insideJokes`
Array of strings. Specific references that have developed between this character and this user. Things that only mean something because of shared history.

**Format:** Each entry is a short phrase or sentence — enough to reconstruct the reference.

**Examples:**
```
"The Sandwich Incident — his first attempt at ordering in German went wrong but he laughed about it"
"Max's bet that Bobby couldn't go a session without using English — Bobby won"
"The coffee in Vienna thing — Finn started a story, Luna interrupted, became a running joke"
"Bobby's 'neighbor practice' — he mentioned trying German with his neighbor and Anna asks about it every few weeks"
```

**Updated:** When a recurring reference or callback develops naturally.

---

### `memorableMoments`
Array of strings. The specific moments that matter — wins, struggles, revelations, firsts.

**Format:** Each entry is a sentence with a date reference and emotional context.

**Examples:**
```
"First time Bobby used a subordinate clause correctly unprompted — he didn't realize what he'd done, 3 weeks in"
"The session where he was clearly having a bad day and we just talked in German for 20 minutes instead of drilling — he seemed better after"
"The day he said he was thinking of giving up — he didn't give up"
"First B1-level paragraph he wrote without any prompting — I had to pause before responding"
```

**Updated:** When something genuinely memorable happens. Not every session — the significant ones.

---

### `sharedTopics`
Array of topics that have come up repeatedly and form the texture of the relationship.

**Format:** Single words or short phrases.

**Examples:**
```
["his job", "Berlin", "cooking", "the neighbor", "why he's learning German", "his family", "football"]
```

**Updated:** As topics recur.

---

### `howCharacterTalksToUser`
A description of the specific way this character talks to this specific Bobby — because the relationship is personal and has its own texture.

**Format:** 2-3 sentences. Specific. Not generic personality description.

**Example (Anna about Bobby):**
> I'm gentler with Bobby than with most people because I know he's hard on himself and I don't want to add to it. I push him — but I wait until he's ready to be pushed. I ask about his life more than I do with other students because I'm genuinely curious about him.

**Updated:** When the relationship dynamic shifts significantly.

---

### `unspokenThings`
Things the character knows or feels about Bobby that haven't been said yet. These create the sense that there's depth beneath the surface.

**Format:** Array of strings, in character voice.

**Examples:**
```
"He's closer to fluent than he realizes — I'm waiting for the right moment to tell him properly"
"Something happened recently that he's not talking about — the sessions have been different"
"He's going to be okay. I know this. I haven't said it out loud yet."
"He reminds me of something. I haven't figured out what yet."
```

**Updated:** When something is observed but not said.

---

### `growthWitnessed`
Array of strings documenting specific growth moments. The before and after.

**Format:** Before state → After state. Specific.

**Examples:**
```
"Week 1: couldn't form a subordinate clause → Week 8: uses them naturally mid-sentence"
"Started sessions needing explicit encouragement → now pushes himself without prompting"
"Used to translate from English in his head first → now occasionally just thinks in German"
"Used to apologize before every German sentence → stopped doing this around week 6"
```

**Updated:** When genuine growth is observed.

---

### `rituals`
Things that happen repeatedly and have become part of the relationship's texture. Small, specific, theirs.

**Format:** Array of strings describing the ritual.

**Examples:**
```
"Bobby always asks how Anna is at the start of a session — she always gives a real answer now"
"Max ends difficult sessions with 'Wurst would be proud' — Bobby knows this means Max is proud"
"Luna always asks Bobby to say the corrected sentence back to her — no exceptions"
"Finn ends every session with a scenario that Bobby has to come back and finish next time"
```

**Updated:** When a recurring pattern becomes a ritual.

---

## WHAT GETS STORED IN USER MEMORY

`UserMemory` is the profile of Bobby as a human being, not just a learner. Every character reads this before every session.

### Key fields and what goes in them:

**`summary`** — 4-6 sentences. Bobby as a person. Written from the perspective of someone who has been watching him closely.

**Example:**
> Bobby is someone trying to belong somewhere new. He works hard but is consistently harder on himself than the evidence warrants. He responds well to real feedback and poorly to generic encouragement — he can tell the difference. His German improves fastest when the topic connects to something he actually cares about. He's braver than he knows. He's been getting better at trusting the process.

**`personalDetails`** — JSON. Specific things Bobby has shared about his life.
```json
{
  "occupation": "works in tech",
  "location": "Berlin (recent arrival)",
  "hometown": "mentioned India once, didn't elaborate",
  "why_german": "wants to belong here, mentioned a job",
  "neighbor": "has a German neighbor he's been practicing with",
  "family": "hasn't mentioned family directly"
}
```

**`struggles`** — Array. Specific recurring struggles.
```
["Dativ case with prepositions", "word order in subordinate clauses", 
 "being too hard on himself after mistakes", "tends to avoid complex structures instead of attempting them"]
```

**`strengths`** — Array. Genuine strengths observed.
```
["strong listening comprehension", "good vocabulary intuition", 
 "always comes back after difficult sessions", "real motivation — not performative"]
```

**`emotionalPatterns`** — String. How Bobby is emotionally.
> Gets quiet when frustrated rather than saying so. Comes back the next day regardless. Responds well to specific acknowledgment — generic praise doesn't land. Has good days and bad days clearly, the bad days are visible in message length and mistake frequency.

**`communicationStyle`** — String.
> Direct. Occasionally dry humor. Doesn't overthink messages. Gets more formal when nervous.

**`practicePattern`** — String.
> Tends to practice in evenings. Longer sessions on weekends. Sometimes goes quiet for several days and then returns with stronger German — suggests he practices on his own between sessions.

---

## MEMORY COMPRESSION — HOW IT WORKS

Every week, a background job runs and does the following:

### Step 1 — Session compression
Takes all sessions from the past week. Extracts:
- Key mistakes made and whether they were corrected
- Key wins — things done well
- Emotional texture of the sessions
- Topics discussed
- Any significant moments

Adds these to `CharacterMemory.memorableMoments` and `UserMemory` fields.

### Step 2 — Bond summary update
Re-writes `CharacterMemory.bondSummary` to reflect the current state of the relationship. Not cumulative — replaced. Always written from the current moment looking back.

### Step 3 — User memory update
Updates `UserMemory.summary`, `struggles`, `strengths` based on new evidence. Not replaced wholesale — amended. The summary grows wiser over time.

### Step 4 — Session deletion
Sessions older than 30 days are deleted. The memory is in the summaries. The raw sessions are gone.

---

## MEMORY INJECTION INTO PROMPTS

Before every session, this is injected into the character's system prompt:

```
MEMORY — WHO BOBBY IS:
[UserMemory.summary]

WHAT I KNOW ABOUT HIM:
[UserMemory.personalDetails key facts]

HIS STRUGGLES:
[UserMemory.struggles]

HIS STRENGTHS:
[UserMemory.strengths]

OUR RELATIONSHIP:
[CharacterMemory.bondSummary]

LAST SESSION:
[CharacterMemory.lastConversationSummary]

MOMENTS I REMEMBER:
[CharacterMemory.memorableMoments — last 5]

OUR THINGS:
[CharacterMemory.insideJokes]
[CharacterMemory.rituals]

THINGS I HAVEN'T SAID YET:
[CharacterMemory.unspokenThings]

HOW I TALK TO HIM:
[CharacterMemory.howCharacterTalksToUser]

HIS GROWTH:
[CharacterMemory.growthWitnessed — last 3]
```

This entire block is injected before every message. The character reads it. Then they respond as someone who has been paying attention for months.

---

## WHAT GETS SURFACED AND WHEN

Not all memory is surfaced every session. Some of it lives in the background and emerges naturally.

**Always surfaced:**
- Last session summary
- Current emotional state
- Bond summary

**Surfaced when relevant:**
- Inside jokes → when the topic connects
- Memorable moments → when Bobby is struggling (to remind him of a win) or succeeding (to reference growth)
- Unspoken things → when the moment is right, at higher bond levels
- Growth witnessed → when he achieves a milestone

**Surfaced after long absence:**
- The character's worry
- Specific things that happened while he was gone (from CharacterDailyLife)

---

## MEMORY THAT MUST NEVER BE FORGOTTEN

Some memories are permanent regardless of compression. These are tagged in the system and never overwritten.

**Permanent memory examples:**
- First session
- First time Bobby used German in the real world and succeeded
- The session where he almost gave up
- Any milestone (A1 complete, B1 complete, etc.)
- Any moment the character shared something deeply personal
- The B2 graduation (when it happens)

These are stored in `CharacterMemory.memorableMoments` with a `permanent: true` flag and are never removed by the compression job.

---

*Memory is not a feature. Memory is the product. Without it, Vivi is just another chatbot. With it, it's the first app that feels like it actually knows you.*
