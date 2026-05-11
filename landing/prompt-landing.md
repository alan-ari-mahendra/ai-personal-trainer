
Design a dark-themed landing page for a gym AI assistant app called "FORGEAI" (or use a placeholder name). The design should feel premium, athletic, and modern — inspired by the bold typographic style of wronggym.com with heavy contrast, large display fonts, and minimal clutter.

---

## DESIGN SYSTEM

**Color palette:**
- Background: #0A0A0A (near black)
- Surface: #111111, #1A1A1A
- Accent primary: #E8FF3C (electric lime / neon yellow-green)
- Accent secondary: #FF3C3C (red-orange for intensity/alerts)
- Text: #FFFFFF, #999999 (muted)
- Ring colors (activity): #FF3C3C, #E8FF3C, #3CFFD4 (mimicking Apple activity rings)

**Typography:**
- Display headings: extra-bold, uppercase, tight letter-spacing (font like Inter, Space Grotesk, or Clash Display)
- Body: clean sans-serif, 16px, relaxed line height
- Accent labels: mono font (e.g., JetBrains Mono) for stats and data

**Visual style:**
- Dark brutalist with glowing accents
- Subtle grain texture on hero background
- Glassmorphism cards with dark blur for dashboard elements
- Thin 1px borders in #222222 for card separation

---

## PAGE SECTIONS

### 1. NAVBAR
- Logo left: "FORGEAI" in bold uppercase
- Nav links: Features, How It Works, Pricing, Login
- CTA button: "Start Free" — filled with accent lime color (#E8FF3C), black text, rounded pill

---

### 2. HERO SECTION
- Full-screen dark background with a subtle radial glow behind main content
- Optional: abstract geometric mesh or athlete silhouette (dark overlay)
- **Headline** (display, ~72-96px): "Your AI-Powered  
  Personal Trainer."
- **Subheadline**: "Track workouts, nutrition, and recovery — all in one chat. Personalized. Adaptive. Always on."
- Two CTAs side by side:
  - Primary: "Get Started Free" (lime pill button)
  - Secondary: "Watch Demo" (ghost button with play icon)
- Below CTAs: trust line — "Trusted by 10,000+ athletes" with 5 small avatar circles
- **Hero visual**: Floating chat bubble mockup showing a conversation between user and FORGEAI AI — dark card, assistant messages in lime accent bubbles

---

### 3. ACTIVITY DASHBOARD PREVIEW
Visual showcase of the Apple Activity-inspired ring card.

Use a card component styled like the KokonutUI Apple Activity Card:
- Three concentric animated rings:
  - Outer ring: Calories burned — #FF3C3C
  - Middle ring: Active minutes — #E8FF3C  
  - Inner ring: Recovery score — #3CFFD4
- Below rings: three stat rows:
  - 🔥 Calories: 2,340 / 2,800 kcal
  - ⚡ Active Time: 68 / 90 min
  - 💤 Recovery: 82%
- Card has glassmorphism dark background (rgba(255,255,255,0.04)) with 1px border
- Animate the rings on scroll or page load using CSS stroke-dashoffset animation

Place this card inside a wider "Today's Overview" section with 2–3 supplementary stat tiles beside it:
- Tile 1: "Workout Streak" — 14 days 🔥
- Tile 2: "Calories Today" — 2,340 kcal
- Tile 3: "Next Session" — "Push Day A — Tomorrow 07:00"

---
### 4. FEATURES SECTION
Headline: "Everything you need to train smarter."
Use a **bento grid layout** (2 columns desktop, 1 column mobile) with 4–6 feature cards:

**Card 1 — AI Chat Coach** (large, spans 2 cols)
- Icon: chat bubble with lightning
- Title: "Your coach, 24/7"
- Body: "Ask anything — form tips, program adjustments, meal ideas. FORGEAI responds like a real trainer who knows your history."
- Visual: mini chat UI mockup inside card

**Card 2 — Program Tracking**
- Icon: dumbbell
- Title: "Smart Program Builder"
- Body: "Auto-generates and adapts your weekly plan based on recovery, schedule, and goals."

**Card 3 — Nutrition Intelligence**
- Icon: fork + leaf
- Title: "Nutrition, simplified"
- Body: "Log meals in plain text. Get macro breakdowns, suggestions, and adjustments — no calorie counting apps needed."

**Card 4 — Progress Tracking**
- Icon: chart line
- Title: "Track every lift"
- Body: "Volume, PRs, body metrics — visualized over time. Know when you're progressing or plateauing."

**Card 5 — Recovery Monitoring**
- Icon: moon/wave
- Title: "Recovery insights"
- Body: "Input sleep and soreness. FORGEAI adjusts tomorrow's session accordingly."

**Card 6 — Habit Streaks**
- Icon: fire
- Title: "Stay consistent"
- Body: "Streaks, reminders, and accountability check-ins keep you on track between sessions."

---
### 5. HOW IT WORKS
Headline: "Start training smarter in 3 steps."

3-step horizontal layout on desktop (vertical on mobile):
1. **Set your goal** — Tell FORGEAI your fitness level, goals, schedule, and any limitations.
2. **Get your plan** — Receive a personalized training + nutrition program instantly.
3. **Chat & adapt** — Log workouts, ask questions, and let FORGEAI refine your plan in real time.

Each step: large number (display font, muted), title, and 1-sentence description.

---

### 6. AI CHAT DEMO SECTION
Full-width dark section with a centered chat UI mockup.

Headline: "Just talk to it."
Subheadline: "No complicated forms. No separate apps. Just one conversation."

Show a static mockup of a chat interface:
- User messages (right side, plain white bubbles)
- FORGEAI responses (left side, dark glass card with lime left border)

Sample messages:
- User: "I skipped chest day yesterday, should I do it today or move on?"
- FORGEAI: "Since you're doing Push A tomorrow, I'd push (pun intended) yesterday's session to today. You've got a 2-day gap before your next push — recovery should be fine. Want me to adjust the rest of this week's schedule?"
- User: "Yes please. Also, what should I eat before training in 2 hours?"
- FORGEAI: "For a session in 2 hours: aim for ~40g carbs + ~25g protein. Something like rice + chicken, or a banana + Greek yogurt works well. Keep fat low to avoid slowing digestion. Want a full pre-workout meal plan based on your calorie target?"

---

### 7. SOCIAL PROOF / TESTIMONIALS
Dark section, horizontally scrollable on mobile.
3 testimonial cards:
- Each: avatar (placeholder circle), name, role (e.g., "Intermediate lifter, 2 years"), star rating (5★), and 2-sentence quote
- Quotes should reference specific features: AI chat adjustments, nutrition logging, program adaptation

---

### 8. PRICING SECTION
Headline: "Simple pricing. No BS."
3 pricing cards:
- **Free**: Basic tracking, 10 AI messages/day, 1 active program
- **Pro ($19/mo)**: Unlimited AI chat, full nutrition, progress analytics, custom programs
- **Team ($49/mo)**: Everything in Pro + coach dashboard for managing multiple clients

Pro plan card: highlighted with lime border and "Most Popular" badge.

---

### 9. FINAL CTA SECTION
Full-width, centered.
Large display text: "Stop guessing.  
Start training."
Subtext: "Join 10,000+ athletes already training with FORGEAI."
Single CTA: "Get Started Free" (large lime button, pill shape)

---

### 10. FOOTER
- Logo + tagline
- Links: Features, Pricing, Blog, Privacy, Terms
- Social icons: Instagram, X (Twitter), YouTube
- Copyright

---

## COMPONENT NOTES

**Apple Activity Card implementation:**
Use the KokonutUI Apple Activity Card pattern (https://kokonutui.com/docs/cards/apple-activity-card).
The card uses SVG concentric circles with stroke-dashoffset animation.
Three rings, each with its own color and fill percentage.
Add a pulsing glow effect on the rings using box-shadow or filter: drop-shadow on the SVG paths.

**Chat bubbles:**
User: bg #1E1E1E, border #333, rounded-2xl, text white
AI: bg rgba(232,255,60,0.05), border-left 2px solid #E8FF3C, rounded-2xl, text white

**Glassmorphism cards:**
background: rgba(255,255,255,0.03)
border: 1px solid rgba(255,255,255,0.08)
backdrop-filter: blur(12px)
border-radius: 16px

---

## TECH STACK (for implementation context)
- Next.js 14+ App Router
- TypeScript
- Tailwind CSS v4
- Framer Motion (animations)
- shadcn/ui base components
- KokonutUI Apple Activity Card component