"use client";

const messages = [
  {
    role: "user" as const,
    text: "I skipped chest day yesterday, should I do it today or move on?",
  },
  {
    role: "ai" as const,
    text: "Since you\u2019re only one day off, I\u2019d recommend pushing the session to today. Your triceps and anterior delts have had extra rest, so you may actually hit stronger numbers. I\u2019ll shift the rest of your week forward by one day. Want me to update the schedule?",
  },
  {
    role: "user" as const,
    text: "Yes please. Also, what should I eat before training in 2 hours?",
  },
  {
    role: "ai" as const,
    text: "Schedule updated. For a pre-workout meal 2 hours out, go with: 40g oats + 1 banana + 25g whey in a shake \u2014 fast to digest, hits ~45g carbs and 30g protein. Avoid high fat or fiber this close to training.",
  },
];

export function ChatDemo() {
  return (
    <section className="mx-auto max-w-[1280px] px-6 py-24">
      {/* Label */}
      <div className="text-center">
        <p
          className="mb-4 inline-flex items-center gap-3 text-[12px] uppercase tracking-[0.25em] text-[var(--muted)]"
          style={{ fontFamily: "var(--font-mono-landing), monospace" }}
        >
          <span className="inline-block h-px w-6 bg-[var(--lime)]" />
          04 &middot; Live Conversation
        </p>
      </div>

      {/* Title */}
      <h2
        className="mb-4 text-center uppercase text-[var(--text)]"
        style={{
          fontFamily: "var(--font-display), system-ui, sans-serif",
          fontWeight: 800,
          fontSize: "clamp(36px, 5vw, 64px)",
          lineHeight: 1.05,
        }}
      >
        Just <span className="text-[var(--lime)]">talk</span> to it.
      </h2>

      {/* Subtitle */}
      <p
        className="mx-auto mb-12 max-w-[520px] text-center text-[17px] leading-[1.7] text-[var(--muted)]"
        style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}
      >
        No complicated forms. No separate apps. Just one conversation.
      </p>

      {/* Chat card */}
      <div
        className="mx-auto max-w-[720px] overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface-1)]"
        style={{
          backgroundImage:
            "linear-gradient(180deg, var(--surface-1) 0%, rgba(17,17,17,0.6) 100%)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] px-7 py-5">
          <div className="flex items-center gap-3">
            <div
              className="flex h-[26px] w-[26px] items-center justify-center rounded-md bg-[var(--lime)]"
              style={{
                fontFamily: "var(--font-display), system-ui, sans-serif",
                fontWeight: 800,
                fontSize: "13px",
                color: "#000",
              }}
            >
              F
            </div>
            <div>
              <span
                className="text-[13px] tracking-[0.1em] text-[var(--text)]"
                style={{
                  fontFamily: "var(--font-mono-landing), monospace",
                  fontWeight: 600,
                }}
              >
                FORGEAI &middot; Coach
              </span>
              <div className="flex items-center gap-1.5 pt-0.5">
                <span
                  className="block h-[5px] w-[5px] rounded-full bg-[#22c55e]"
                  style={{ boxShadow: "0 0 6px rgba(34,197,94,0.6)" }}
                />
                <span
                  className="text-[11px] text-[var(--muted-2)]"
                  style={{ fontFamily: "var(--font-mono-landing), monospace" }}
                >
                  Online
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex flex-col gap-3 px-7 py-6">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-[14px] leading-[1.6] ${
                  msg.role === "user"
                    ? "rounded-br-md bg-[var(--surface-2)] text-[var(--text)]"
                    : "rounded-bl-md border border-[var(--line)] bg-[var(--bg)] text-[var(--muted)]"
                }`}
                style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-[var(--line)] bg-[var(--bg)] px-4 py-3">
              {[0, 0.15, 0.3].map((delay, i) => (
                <span
                  key={i}
                  className="block h-[5px] w-[5px] rounded-full bg-[var(--muted-2)]"
                  style={{
                    animation: `typing-bounce 1.4s ease-in-out ${delay}s infinite`,
                  }}
                />
              ))}
            </div>
            <span
              className="text-[11px] text-[var(--muted-2)]"
              style={{ fontFamily: "var(--font-mono-landing), monospace" }}
            >
              FORGEAI is thinking&hellip;
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
