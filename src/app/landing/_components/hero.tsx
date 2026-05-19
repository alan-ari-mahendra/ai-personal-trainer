"use client";

const chatMessages = [
  {
    role: "user" as const,
    text: "How was my squat form yesterday?",
  },
  {
    role: "ai" as const,
    text: "Depth was clean \u2014 92% of reps below parallel. Bar drift on rep 7 of set 3. Want me to add tempo work on Friday to dial it in?",
  },
  {
    role: "user" as const,
    text: "Yes, and bump weight 5lb.",
  },
  {
    role: "ai" as const,
    text: "Done. Friday: 4\u00d76 @ 225lb, 3-1-X tempo. I\u2019ll watch RPE.",
  },
];

const avatarColors = ["#e8ff3c", "#ff3c3c", "#3cffd4", "#7c6bff", "#ff8f3c"];

export function Hero() {
  return (
    <section
      className="hero-glow relative mx-auto max-w-[1280px] px-6 pb-24 pt-20"
    >
      <div
        className="grid items-center gap-16"
        style={{
          gridTemplateColumns: "1.1fr 0.9fr",
        }}
      >
        {/* ===== Left Column ===== */}
        <div className="flex flex-col gap-8">
          {/* Eyebrow badge */}
          <div className="flex w-fit items-center gap-2.5 rounded-full border border-[var(--line)] bg-[var(--surface-1)] px-4 py-1.5">
            <span
              className="block h-[6px] w-[6px] rounded-full bg-[var(--lime)]"
              style={{
                animation: "pulse-glow 2s ease-in-out infinite",
                boxShadow: "0 0 6px rgba(232, 255, 60, 0.6)",
              }}
            />
            <span
              className="text-[12px] tracking-[0.12em] uppercase text-[var(--muted)]"
              style={{
                fontFamily:
                  "var(--font-mono), monospace",
              }}
            >
              AI Coach &middot; Always On
            </span>
          </div>

          {/* Heading */}
          <h1
            className="uppercase"
            style={{
              fontFamily: "var(--font-display), system-ui, sans-serif",
              fontWeight: 800,
              fontSize: "clamp(48px, 7.2vw, 96px)",
              lineHeight: 0.92,
              letterSpacing: "-0.02em",
            }}
          >
            <span
              style={{
                WebkitTextStroke: "1.5px white",
                color: "transparent",
              }}
            >
              AI-Powered
            </span>
            <br />
            <span className="text-[var(--lime)]">Personal</span>
            <br />
            Trainer
          </h1>

          {/* Subtitle */}
          <p
            className="max-w-[480px] text-[17px] leading-[1.7] text-[var(--muted)]"
            style={{
              fontFamily: "var(--font-body), system-ui, sans-serif",
            }}
          >
            Track workouts, nutrition, and recovery &mdash; all in one chat.
            Personalized. Adaptive. Always on.
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-4">
            <a
              href="/register"
              className="rounded-full bg-[var(--lime)] px-7 py-3 text-[15px] font-semibold text-black transition-opacity duration-200 hover:opacity-90"
              style={{
                fontFamily: "var(--font-body), system-ui, sans-serif",
              }}
            >
              Start Free
            </a>
            <a
              href="#"
              className="flex items-center gap-2 rounded-full border border-[var(--line)] px-7 py-3 text-[15px] font-medium text-[var(--text)] transition-colors duration-200 hover:border-[var(--muted-2)]"
              style={{
                fontFamily: "var(--font-body), system-ui, sans-serif",
              }}
            >
              See How It Works
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </a>
          </div>

          {/* Trust line */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex -space-x-2">
              {avatarColors.map((color, i) => (
                <div
                  key={i}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--bg)] text-[11px] font-bold text-black"
                  style={{ background: color }}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <span
              className="text-[13px] text-[var(--muted-2)]"
              style={{
                fontFamily: "var(--font-body), system-ui, sans-serif",
              }}
            >
              Join 2,400+ athletes already training with AI
            </span>
          </div>
        </div>

        {/* ===== Right Column — Chat Mockup ===== */}
        <div className="relative">
          <div className="hero-visual-border relative overflow-hidden rounded-3xl bg-[var(--surface-1)]">
            {/* Chat header */}
            <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--lime)]"
                  style={{
                    boxShadow: "0 0 12px rgba(232, 255, 60, 0.3)",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#000"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
                <div>
                  <span
                    className="text-[13px] tracking-[0.1em] text-[var(--text)]"
                    style={{
                      fontFamily:
                        "var(--font-mono), monospace",
                      fontWeight: 600,
                    }}
                  >
                    FORGEAI &middot; Chat
                  </span>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span
                      className="block h-[5px] w-[5px] rounded-full bg-[var(--lime)]"
                      style={{
                        boxShadow: "0 0 6px rgba(232, 255, 60, 0.6)",
                      }}
                    />
                    <span
                      className="text-[11px] text-[var(--muted-2)]"
                      style={{
                        fontFamily:
                          "var(--font-mono), monospace",
                      }}
                    >
                      Online
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1.5">
                <span className="block h-[10px] w-[10px] rounded-full bg-[var(--surface-2)]" />
                <span className="block h-[10px] w-[10px] rounded-full bg-[var(--surface-2)]" />
                <span className="block h-[10px] w-[10px] rounded-full bg-[var(--surface-2)]" />
              </div>
            </div>

            {/* Chat messages */}
            <div className="flex flex-col gap-3 px-5 py-5">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-[1.6] ${
                      msg.role === "user"
                        ? "rounded-br-md bg-[var(--surface-2)] text-[var(--text)]"
                        : "rounded-bl-md border border-[var(--line)] bg-[var(--bg)] text-[var(--muted)]"
                    }`}
                    style={{
                      fontFamily:
                        "var(--font-body), system-ui, sans-serif",
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-[var(--line)] bg-[var(--bg)] px-4 py-3">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="block h-[5px] w-[5px] rounded-full bg-[var(--muted-2)]"
                      style={{
                        animation: `typing-bounce 1.4s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Input bar */}
            <div className="border-t border-[var(--line)] px-5 py-4">
              <div className="flex items-center gap-3 rounded-xl border border-[var(--line-soft)] bg-[var(--surface-2)] px-4 py-3">
                <span
                  className="flex-1 text-[13px] text-[var(--muted-2)]"
                  style={{
                    fontFamily:
                      "var(--font-body), system-ui, sans-serif",
                  }}
                >
                  Type a message...
                </span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--muted-2)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m22 2-7 20-4-9-9-4z" />
                  <path d="M22 2 11 13" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Mobile responsive style ===== */}
      <style>{`
        @media (max-width: 960px) {
          .hero-glow > div:first-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
