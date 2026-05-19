# P2-M6: User Onboarding — Biodata + AI Assisted Setup

> **Dependencies:** Auth (M2), Chat streaming (M4), Server Actions
> **Output:** New users redirected to onboarding page after first register. Split-screen: form (left) + AI chat (right). AI fills form via chat.

---

## Konsep

User baru register → redirect ke `/onboarding` (bukan `/chat`).
Halaman split 2 kolom:
- **Kiri:** Form biodata (editable, real-time update)
- **Kanan:** AI chat assistant yang bantu isi form

User punya 2 pilihan:
1. Isi form manual langsung
2. Chat sama AI → AI response otomatis mengisi field form di kiri

Setelah form complete + user klik "Mulai" → save biodata → redirect ke `/chat` atau `/dashboard`.

---

## Database Changes

Tambah kolom di `users` table:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS height_cm DECIMAL(5,1);
ALTER TABLE users ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(5,2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(10)
    CHECK (gender IN ('male', 'female', 'other'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS exercise_history TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS injuries TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
```

Field `onboarding_completed` = flag untuk redirect logic.

---

## Redirect Logic

```
User login/register
  → Check onboarding_completed
  → FALSE → redirect /onboarding
  → TRUE → redirect /chat (normal flow)
```

Update di `src/app/page.tsx` dan `src/app/(main)/layout.tsx`.

---

## UI Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  FitAI — Setup Profile                              [Skip →]   │
├────────────────────────────┬────────────────────────────────────┤
│                            │                                    │
│  📋 FORM (kiri)            │  💬 AI ASSISTANT (kanan)           │
│                            │                                    │
│  Nama Lengkap              │  ┌──────────────────────────────┐  │
│  [___________________]     │  │ Halo! Gue JASON. 👋         │  │
│                            │  │ Ceritain aja tentang kamu —   │  │
│  Jenis Kelamin             │  │ berat, tinggi, pengalaman     │  │
│  (○) Pria (○) Wanita       │  │ olahraga, goal fitness kamu.  │  │
│                            │  │ Nanti gue bantu isi formnya!  │  │
│  Umur                      │  └──────────────────────────────┘  │
│  [___] tahun               │                                    │
│                            │  User: "Saya cowok 25 tahun,       │
│  Tinggi Badan              │  tinggi 175cm berat 80kg. Dulu     │
│  [___] cm                  │  pernah gym 2 tahun tapi udah      │
│                            │  setahun vakum. Mau cutting."      │
│  Berat Badan               │                                    │
│  [___] kg                  │  JASON: "Sip, udah gue catet:     │
│                            │  ✅ Gender: Pria                   │
│  Goal Fitness              │  ✅ Umur: 25 tahun                 │
│  [Cutting ▾]               │  ✅ TB: 175cm, BB: 80kg            │
│                            │  ✅ Goal: Cutting                  │
│  Level Aktivitas           │  ✅ Level: Moderate                 │
│  [Moderate ▾]              │  ✅ Riwayat: Gym 2 tahun, vakum    │
│                            │     1 tahun                        │
│  Riwayat Olahraga          │                                    │
│  [Gym 2 tahun, vakum      │  Cek formnya, koreksi kalau ada    │
│   1 tahun____________]     │  yang kurang tepat!"               │
│                            │                                    │
│  Cedera / Limitasi         │  ┌────────────────────────────┐    │
│  [___________________]     │  │ Ketik pesan...          [→]│    │
│                            │  └────────────────────────────┘    │
│                            │                                    │
│  [🚀 Mulai Training]      │                                    │
│                            │                                    │
└────────────────────────────┴────────────────────────────────────┘
```

**Mobile:** Stack vertical — form di atas, AI chat di bawah (scroll).

---

## AI Agent: JASON

AI assistant di onboarding bernama **JASON** (bukan generic "FitAI"). Personality: santai, supportive, kayak ngobrol sama personal trainer di gym.

## AI Chat Behavior (Onboarding Mode)

System prompt khusus onboarding:

```
Kamu adalah JASON, AI personal trainer dari FitAI. Tugasmu membantu user baru mengisi profil.

Kamu HARUS merespon dalam 2 bagian:

1. JSON block (untuk auto-fill form) — WAJIB ada di awal response:
---FORM_DATA---
{"form_updates": {"display_name": "...", "gender": "male", "age": 25, "height_cm": 175, "weight_kg": 80, "goal": "cutting", "activity_level": "moderate", "exercise_history": "...", "injuries": null}}
---END_FORM_DATA---

2. Pesan conversational ke user (konfirmasi apa yang diisi + tanya follow-up).

Rules:
- Hanya isi field yang user sebutkan. Null/omit = tidak diisi.
- goal: bulking | cutting | maintenance | health
- activity_level: sedentary | light | moderate | active | very_active
- gender: male | female | other
- Jika user belum lengkap, tanya yang belum diisi
- Panggil diri kamu JASON
- Santai, supportive, kayak ngobrol sama PT di gym
- Jangan pressure user isi semua — semua opsional
```

**Client-side parsing:**

1. Extract JSON between `---FORM_DATA---` / `---END_FORM_DATA---` markers
2. Apply `form_updates` ke form state (merge, bukan replace)
3. Display text response (tanpa JSON block) di chat
4. Show "chips" di bawah AI bubble — visual indicator field apa yang baru di-fill (✅ Gender: Pria, ✅ BB: 80kg, dll)
5. **Flash animation** pada form field yang baru diisi — border glow lime sesaat (600ms, lihat HTML design)
6. Field yang AI-fill dapat badge "AI Filled" kecil di label

## Chat UX Details (dari HTML design)

- **Hint buttons** di bawah input: quick-fill suggestions ("Sedentary, kerja kantoran", "Punya cedera lutut", "Goal bulking lean"). Klik → isi ke input field
- **Typing indicator** saat AI processing: 3 bouncing dots + "JASON lagi mikir..."
- **Chips** di AI response bubble: clickable, klik → scroll + highlight target field di form kiri
- **Flash animation** (`flash-fill` keyframe): field border + bg flash lime 600ms saat AI fill

---

## API / Server Action

### `POST /api/chat/onboarding` (API route — needs SSE streaming)

Mirip `/api/chat` tapi:
- System prompt khusus onboarding
- Tidak save ke `chat_history` (temporary)
- Response parsed client-side untuk extract form_updates

Atau alternatif: reuse `/api/chat` dengan parameter `mode: 'onboarding'` yang switch system prompt.

### Server Action: `saveOnboarding(data)`

```typescript
// lib/actions/onboarding.ts
'use server';

export async function saveOnboarding(data: {
  display_name: string | null;
  gender: string | null;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  goal: string;
  activity_level: string;
  exercise_history: string | null;
  injuries: string | null;
}) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  await sql`
    UPDATE users SET
      display_name = ${data.display_name},
      gender = ${data.gender},
      age = ${data.age},
      height_cm = ${data.height_cm},
      weight_kg = ${data.weight_kg},
      goal = ${data.goal},
      activity_level = ${data.activity_level},
      exercise_history = ${data.exercise_history},
      injuries = ${data.injuries},
      onboarding_completed = TRUE,
      updated_at = NOW()
    WHERE id = ${session.userId}
  `;

  // Also save initial weight to body_stats
  if (data.weight_kg) {
    await sql`
      INSERT INTO body_stats (user_id, weight_kg, recorded_at)
      VALUES (${session.userId}, ${data.weight_kg}, CURRENT_DATE)
      ON CONFLICT (user_id, recorded_at) DO UPDATE SET weight_kg = ${data.weight_kg}
    `;
  }
}

export async function checkOnboarding() {
  const session = await getSession();
  if (!session) return false;
  const result = await sql`
    SELECT onboarding_completed FROM users WHERE id = ${session.userId}
  `;
  return result[0]?.onboarding_completed === true;
}
```

---

## File Structure

```
src/
├── app/
│   ├── onboarding/
│   │   ├── page.tsx              # Split-screen onboarding page
│   │   └── layout.tsx            # Minimal layout (no sidebar)
│   └── api/
│       └── chat/
│           └── route.ts          # Update: support mode='onboarding'
├── components/
│   └── onboarding/
│       ├── onboarding-form.tsx   # Left: editable biodata form
│       └── onboarding-chat.tsx   # Right: AI chat (reuse chat components)
├── lib/
│   └── actions/
│       └── onboarding.ts         # saveOnboarding, checkOnboarding
└── hooks/
    └── use-onboarding-chat.ts    # Modified use-chat that extracts form_updates
```

---

## Flow Lengkap

```
1. User register → redirect /onboarding
2. Page load: split screen (form kiri, chat kanan)
3. JASON greet: "Halo! Gue JASON. Ceritain aja tentang kamu..."
4. User chat: "Cowok 25 tahun, 175cm 80kg, mau cutting"
5. AI response stream:
   - Extract ---FORM_DATA--- → update form fields real-time
   - Display chat text + chips (✅ Gender: Pria, ✅ BB: 80kg, dll)
   - Flash animation on filled fields (600ms lime glow)
6. Form fields update animated (highlight yang berubah)
7. User bisa edit form manual kapan saja
8. User bisa chat lagi untuk update: "eh salah, berat 78kg"
   - AI update form: weight_kg = 78
9. User klik "Mulai Training"
   - No required fields — semua opsional
   - saveOnboarding() → update users table
   - Redirect /chat atau /dashboard
```

---

## Acceptance Criteria

- [ ] Register → redirect ke /onboarding (bukan /chat)
- [ ] Split screen: form kiri, AI chat kanan
- [ ] AI chat response auto-fill form fields
- [ ] Form fields editable manual
- [ ] Multiple chat turns update form (merge, not replace)
- [ ] Field yang berubah di-highlight sesaat (visual feedback)
- [ ] "Mulai Training" → save + redirect
- [ ] Skip button → save minimal data + redirect
- [ ] Returning user (onboarding_completed=true) → skip onboarding
- [ ] Mobile responsive — stacked vertical
- [ ] Initial weight saved ke body_stats table juga
- [ ] AI agent named JASON with casual personality
- [ ] Chips in AI bubble showing which fields were filled (clickable → highlight field)
- [ ] Flash animation (lime glow 600ms) on AI-filled form fields
- [ ] "AI Filled" badge on field labels after AI fills them
- [ ] Chat hint buttons below input (quick suggestions)
- [ ] Typing indicator: "JASON lagi mikir..." with bouncing dots

---

## Data Optional & Missing Data Warnings

Semua field biodata **optional** — user boleh skip field manapun termasuk BB dan TB.

**Saat onboarding:**
- Tidak ada required field. User bisa langsung klik "Mulai Training" tanpa isi apa-apa
- AI chat tetap encourage user isi tapi tidak block progress
- Form show subtle hint: "Bisa diisi nanti di Settings"

**Saat perhitungan butuh data kosong:**

Fitur yang butuh BB/TB (BMI, TDEE, calorie target, dll) → tampilkan inline warning:

```
⚠️ Berat badan belum diisi. Isi di Settings untuk estimasi kalori yang lebih akurat.
[Isi Sekarang →]
```

Implementasi:
- Helper function `getUserProfile(userId)` return user data
- Di dashboard/chat/tracker, cek apakah field kritis null
- Jika null → tampilkan `<MissingDataBanner field="weight" />` component
- Banner dismissable per session, tapi muncul lagi next session
- Link langsung ke Settings page (atau modal quick-fill)

**Fields dan dampak jika kosong:**

| Field | Jika kosong | Impact |
|-------|-------------|--------|
| weight_kg | Skip BMI, skip TDEE calc | Warning di dashboard + chat |
| height_cm | Skip BMI calc | Warning di dashboard |
| age | Skip TDEE calc | Warning di calorie recommendation |
| gender | Default formula (less accurate) | Soft warning |
| goal | Default 'maintenance' | None |
| activity_level | Default 'moderate' | None |
| exercise_history | AI less context | None |
| injuries | AI less context | None |

---

## Edge Cases

- User skip tanpa isi apa-apa → save default values, set onboarding_completed=true
- User refresh halaman → form state persists (atau kosong, acceptable)
- User sudah onboarding tapi navigate ke /onboarding → redirect away
- AI parse error → form tidak berubah, chat show error
- User tidak tau BB/TB → skip, warning muncul di fitur yang butuh data tersebut
- User isi BB/TB nanti via Settings → warning hilang otomatis
