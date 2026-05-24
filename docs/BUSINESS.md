# VIVI — BUSINESS
### Monetisation, pricing, release roadmap.
> *Reference this when making product and pricing decisions.*

---

## THE PLANS

### FREE
- Anna only
- Anna runs on Claude Haiku
- 20 conversations per day (resets midnight local time)
- 10 lessons
- Earn Max, Luna, Finn through XP progression
- Basic flashcard reviews (SM-2 algorithm, no AI)
- Streak tracking + XP
- Core story mode chapters

### PRO — €9/month
- All EPIC characters unlocked immediately
- All characters run on Claude Sonnet (noticeably smarter, better character voice)
- Unlimited conversations
- All 265+ lessons
- Custom YouTube channel (any channel, any language)
- Multiple target languages
- All future EPIC characters included on release — no extra charge
- Full Coach Report + Weekly Digest
- Priority memory (longer context window)

---

## THE UPGRADE MOMENT

Users upgrade because of a character. Specifically **Prof. Weber**.

For weeks, users see Weber's silhouette in the character selector. Locked. They read his teaser: *"Luna's mentor. Has forgotten more German grammar than most people learn in a lifetime."* They get curious. They see Luna mention him occasionally. They want access.

Weber is what converts free users to Pro. Not features. A person they want to meet.

The upgrade flow:
1. User taps Weber's locked silhouette
2. Full-screen Pro card — not a features list, Weber's character description
3. One clear CTA: **Unlock Weber and everything else — €9/month**
4. After upgrade: Weber's first message is pre-written, perfectly calibrated, slightly terrifying

---

## PRICING RATIONALE

€9/month is positioned below Duolingo Plus (€13/month) and Babbel (€10/month).

But the value proposition is different: those apps offer more content. Vivi offers a relationship. The pricing should feel like less than a coffee per week for people who have become genuinely attached to the characters.

Future consideration: annual plan at €79/year (save ~€29).

---

## RELEASE ROADMAP

### Phase 1 — Foundation ✅ Complete
- Core chat with Anna (Sprint 1)
- Auth (Clerk) + Database (PostgreSQL Railway) + Deploy (Netlify + Railway)
- User sync, sign in/out

### Phase 2 — The World Begins (Current — Sprint 2)
- AI abstraction layer (VIVI-20) ✅
- UserModel service (VIVI-19) ✅
- Anna's dynamic system prompt (VIVI-21)
- Anna onboarding flow (VIVI-22)
- XP system (VIVI-24)
- Streak tracking (VIVI-25)
- Max unlock at 500 XP (VIVI-26)
- Anna visual avatar + expressions (VIVI-27)
- Voice input/output — Web Speech API (VIVI-28)

### Phase 3 — The Gang Arrives (Sprint 3)
- Luna + Finn unlock
- Virtual Classroom
- Story Mode chapters 1-6
- Cards Agent (SM-2 full implementation)
- Coach Agent (background monitoring)
- Watch Party (YouTube + character comments)
- Full anime dialogue UI

### Phase 4 — Public Launch (Sprint 4)
- Stripe integration (Free vs Pro)
- All EPIC characters (Weber, Zara, DJ Kai, Sophie)
- Extended roster (Marco, Yuki, Mia, Oma Helga)
- Story Mode complete (all 20 chapters)
- Memory Album
- Graduation ceremonies (A1, A2, B1, B2)
- Weekly Digest + Coach Report in UI
- Marketing site

### Phase 5 — The World Expands (Post-launch)
- French character set (Léa equivalent for French)
- Spanish character set
- Community features
- User-created scenarios
- Mobile app (React Native)
- Multi-agent group chat (all 4 characters simultaneously)
- Seasonal events (Oktoberfest, Christmas, New Year)

---

## KEY METRICS

### What we track
- Daily Active Users (DAU)
- Conversation count per user per day
- Session length (target: 15+ minutes)
- Streak retention (users who maintain 7+ day streaks)
- Character bond level distribution (how many users reach bond 3+ with Anna)
- Free → Pro conversion rate
- Churn rate (Pro users who cancel)

### The north star metric
**7-day streak rate** — the percentage of users who are still active 7 days after signup. This is the single best predictor of long-term retention. A user who has a 7-day streak has formed a habit and a relationship. They almost never leave.

Everything in the product — the Missing You system, the missions, the characters noticing absence — exists to protect the streak.

---

## COMPETITIVE POSITION

| Product | Core mechanic | Vivi's difference |
|---|---|---|
| Duolingo | Gamification + habit | Real relationships, not game mechanics |
| Babbel | Structured lessons | Emotional connection, not curriculum |
| Pimsleur | Audio repetition | Dynamic conversation, not drilling |
| iTalki | Human tutors | Always available, remembers everything |
| ChatGPT | Generic AI | Characters with memory, personality, world |

Vivi's moat: **the relationships.** The longer someone uses Vivi, the more irreplaceable it becomes. No competitor can copy a year of shared history with Anna.

---

## THE BUSINESS MODEL TRUTH

Vivi is not selling language lessons. Vivi is selling the feeling of having people who know you, believe in you, and celebrate you.

Language is the reason people come. The characters are the reason they stay.

Everything — the pricing, the unlock system, the graduation ceremonies, the missing you messages — serves this truth.
