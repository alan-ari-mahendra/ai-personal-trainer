"use client";

const steps = [
  {
    num: "01",
    title: "Set your goal",
    desc: "Tell FORGEAI your fitness level, goals, schedule, and any limitations.",
  },
  {
    num: "02",
    title: "Get your plan",
    desc: "Receive a personalized training + nutrition program instantly.",
  },
  {
    num: "03",
    title: "Chat & adapt",
    desc: "Log workouts, ask questions, and let FORGEAI refine your plan in real time.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-[1280px] px-6 py-24">

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
        Start training smarter in{" "}
        <span className="text-[var(--lime)]">3 steps.</span>
      </h2>

      {/* Steps grid */}
      <div className="hiw-grid grid gap-4" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {steps.map((step) => (
          <div
            key={step.num}
            className="step-accent relative border-t border-[var(--line)] pt-8"
          >
            {/* Large number */}
            <span
              style={{
                fontFamily: "var(--font-display), system-ui, sans-serif",
                fontWeight: 800,
                fontSize: "64px",
                lineHeight: 1,
                color: "transparent",
                WebkitTextStroke: "1px #333",
              }}
            >
              {step.num}
            </span>

            {/* Title */}
            <h4
              className="mt-6 uppercase text-[var(--text)]"
              style={{
                fontFamily: "var(--font-display), system-ui, sans-serif",
                fontWeight: 700,
                fontSize: "22px",
              }}
            >
              {step.title}
            </h4>

            {/* Description */}
            <p
              className="mt-2.5 text-[15px] text-[var(--muted)]"
              style={{
                fontFamily: "var(--font-body), system-ui, sans-serif",
              }}
            >
              {step.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 768px) {
          .hiw-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
