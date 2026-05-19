Build the onboarding page for FitAI based on the spec below. Match the design system, color palette, typography, component styles, and motion patterns exactly from the landing page above.

---

## Page: /onboarding — AI-Assisted Biodata Setup

One-time setup page shown to new users after registration. Minimal layout — no sidebar, no bottom nav.

**Top bar:**
- Left: FitAI logo (same as landing)
- Right: ghost button "Lewati →"

**Layout (desktop):** 2-column split
- Left 45%: Biodata form
- Right 55%: AI chat assistant
- Vertical divider line between panels

**Layout (mobile):** stacked vertical — chat top (collapsible), form below

---

## LEFT PANEL: Biodata Form

Label: "📋 PROFIL KAMU"

Fields (all optional):
1. Nama Tampilan — text input
2. Jenis Kelamin — 3 pill radio: Pria / Wanita / Lainnya
3. Umur — number input, suffix "tahun", mono font
4. Tinggi Badan — number input, suffix "cm", mono font
5. Berat Badan — number input, suffix "kg", mono font
6. Goal Fitness — custom select: ⚡ Cutting / 💪 Bulking / 🔄 Maintenance / ❤️ Health
7. Level Aktivitas — custom select: Sedentary / Light / Moderate / Active / Very Active
8. Riwayat Olahraga — textarea, placeholder: "Contoh: Gym 2 tahun, sekarang vakum..."
9. Cedera / Limitasi — textarea, placeholder: "Tulis jika ada, atau kosongkan"

Helper text below textareas: "Bisa diisi nanti di Settings" (muted, small)

CTA: full-width primary button "🚀 MULAI TRAINING" sticky at bottom of panel

---

## RIGHT PANEL: AI Chat

Label: "💬 CHAT SAMA AI"

AI greeting bubble on load:
"Halo! Gue FitAI. 👋 Ceritain aja tentang kamu — berat badan, tinggi, pengalaman olahraga, dan tujuan fitness kamu. Nanti gue bantu isi formnya otomatis!"

Show a sample conversation state:
- User: "Saya cowok 25 tahun, 175cm 80kg. Dulu gym 2 tahun tapi vakum setahun. Mau cutting."
- AI response with confirmation chips: ✅ Gender: Pria  ✅ Umur: 25  ✅ TB: 175cm  ✅ BB: 80kg  ✅ Goal: Cutting

AI bubble style: accent-colored left border, subtle accent tint background
User bubble style: surface card, right-aligned
Confirmation chips: small pills in accent color

Input area sticky at bottom: text field + send icon button

---

## Interaction Notes

When AI fills a field → brief border glow + background flash on that input (600ms), then returns to normal.
All form fields remain manually editable at all times.