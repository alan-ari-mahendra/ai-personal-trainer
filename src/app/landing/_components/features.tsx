"use client";

/* ── icon SVGs ───────────────────────────────────────────── */

function ChatIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--lime)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function DumbbellIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--lime)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 6.5h11M6.5 17.5h11" />
      <rect x="2" y="5" width="4.5" height="14" rx="1.5" />
      <rect x="17.5" y="5" width="4.5" height="14" rx="1.5" />
      <path d="M12 5v14" />
    </svg>
  );
}

function ForkIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--lime)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v8" />
      <path d="M6 6c0 3.3 2.7 6 6 6s6-2.7 6-6" />
      <path d="M12 14v8" />
      <circle cx="12" cy="22" r="0" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--lime)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M7 16l4-6 4 4 5-8" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--lime)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function FireIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--lime)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c4.97 0 8-3.58 8-8 0-5.5-4-8-4-12 0 0-2 2.5-2 5-.5-1.5-2-3.5-2-3.5S11 7 11 10c-1-1-2-3.5-2-3.5S6 9.5 6 14c0 4.42 3.03 8 6 8z" />
    </svg>
  );
}

/* ── feature data ────────────────────────────────────────── */

const features = [
  {
    icon: <ChatIcon />,
    title: "Your coach, 24/7",
    desc: "Chat with an AI that knows your program, your history, and your goals. Get instant answers on form, substitutions, and progressions.",
    span: 4,
    tall: true,
  },
  {
    icon: <DumbbellIcon />,
    title: "Smart Program Builder",
    desc: "Generate a periodized training program tailored to your experience, schedule, and equipment.",
    span: 2,
  },
  {
    icon: <ForkIcon />,
    title: "Nutrition simplified",
    desc: "Log meals in seconds. Get macro breakdowns, suggestions, and weekly trends without the spreadsheet.",
    span: 2,
  },
  {
    icon: <ChartIcon />,
    title: "Track every lift",
    desc: "Automatic progressive overload tracking with rep and set PRs surfaced over time.",
    span: 2,
  },
  {
    icon: <MoonIcon />,
    title: "Recovery insights",
    desc: "Sleep, soreness, and readiness scores so you know when to push and when to rest.",
    span: 2,
  },
  {
    icon: <FireIcon />,
    title: "Stay consistent",
    desc: "Streaks, milestones, and gentle nudges designed to keep you coming back day after day.",
    span: 2,
  },
];

/* ── mini chat mockup ────────────────────────────────────── */

function MiniChat() {
  const bubbles: { from: "user" | "ai"; text: string }[] = [
    { from: "user", text: "Can I swap deadlifts today? My lower back is tight." },
    { from: "ai", text: "Sure — try trap-bar deadlifts or hip thrusts instead. Same posterior-chain stimulus, less spinal load." },
    { from: "user", text: "Perfect." },
  ];

  return (
    <div
      className="mt-5 flex flex-col gap-2.5 rounded-[14px] border border-[var(--surface-1)] p-4"
      style={{ background: "var(--surface-1)" }}
    >
      {bubbles.map((b, i) => (
        <div
          key={i}
          className={`flex ${b.from === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[80%] rounded-[10px] px-3.5 py-2 text-[12.5px] leading-[1.55] ${
              b.from === "user"
                ? "bg-[var(--surface-2)] text-[var(--text)]"
                : "border border-[var(--line-soft)] text-[var(--muted)]"
            }`}
            style={{
              fontFamily: "var(--font-body), system-ui, sans-serif",
              background: b.from === "ai" ? "rgba(255,255,255,0.02)" : undefined,
            }}
          >
            {b.from === "ai" && (
              <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--lime)]">
                ForgeAI
              </span>
            )}
            {b.text}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Features section ────────────────────────────────────── */

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-[1280px] px-6 py-24">
      {/* Label */}
      <p
        className="section-dash mb-4 text-[12px] uppercase tracking-[0.25em] text-[var(--muted)]"
        style={{ fontFamily: "var(--font-mono), monospace" }}
      >
        02 · Features
      </p>

      {/* Title */}
      <h2
        className="mb-12 uppercase text-[var(--text)]"
        style={{
          fontFamily: "var(--font-display), system-ui, sans-serif",
          fontWeight: 800,
          fontSize: "clamp(36px, 5vw, 64px)",
          lineHeight: 1.05,
        }}
      >
        Everything you need to{" "}
        <span className="text-[var(--lime)]">train smarter.</span>
      </h2>

      {/* Bento grid */}
      <div className="landing-features-grid grid gap-4" style={{ gridTemplateColumns: "repeat(6, 1fr)" }}>
        {features.map((f, i) => (
          <div
            key={i}
            className="group rounded-[20px] border border-[var(--line-soft)] p-7 backdrop-blur-[12px] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--lime)]"
            style={{
              background: "rgba(255,255,255,0.03)",
              gridColumn: `span ${f.span}`,
              minHeight: f.tall ? 360 : undefined,
              boxShadow: undefined,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 0 24px rgba(232, 255, 60, 0.08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            {/* icon box */}
            <div
              className="mb-5 flex h-[44px] w-[44px] items-center justify-center rounded-xl border border-[var(--lime)]"
              style={{ background: "rgba(232, 255, 60, 0.04)" }}
            >
              {f.icon}
            </div>

            {/* title */}
            <h3
              className="mb-2 text-[var(--text)]"
              style={{
                fontFamily: "var(--font-display), system-ui, sans-serif",
                fontWeight: 700,
                fontSize: "22px",
              }}
            >
              {f.title}
            </h3>

            {/* description */}
            <p
              className="text-[var(--muted)]"
              style={{
                fontFamily: "var(--font-body), system-ui, sans-serif",
                fontSize: "14.5px",
                lineHeight: 1.6,
              }}
            >
              {f.desc}
            </p>

            {/* mini chat only in first card */}
            {i === 0 && <MiniChat />}
          </div>
        ))}
      </div>
    </section>
  );
}
