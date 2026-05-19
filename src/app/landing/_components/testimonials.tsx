"use client";

const testimonials = [
  {
    name: "Marcus Reid",
    role: "Intermediate \u00b7 4 yrs",
    initials: "MR",
    gradient: "linear-gradient(135deg, var(--red), #ff8f3c)",
    quote:
      "The AI actually remembers what I lifted last week and adjusts my program on the fly. I\u2019ve never had a coach this dialed in \u2014 and I\u2019ve had three.",
  },
  {
    name: "Sarah Chen",
    role: "Recomp \u00b7 Beginner",
    initials: "SC",
    gradient: "linear-gradient(135deg, var(--lime), var(--teal))",
    quote:
      "Logging meals by typing \u2018two eggs and oats\u2019 instead of scanning barcodes changed everything. I actually stick with it now.",
  },
  {
    name: "Dani Okafor",
    role: "Advanced \u00b7 8 yrs",
    initials: "DO",
    gradient: "linear-gradient(135deg, var(--teal), #7c6bff)",
    quote:
      "It caught my shoulder fatigue pattern before I did. Deloaded my overhead volume for a week, and my press PR\u2019d the week after.",
  },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-[1280px] px-6 py-24">
      {/* Label */}
      <p
        className="section-dash mb-4 flex items-center gap-3 text-[12px] uppercase tracking-[0.25em] text-[var(--muted)]"
        style={{ fontFamily: "var(--font-mono), monospace" }}
      >
        05 &middot; Social Proof
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
        Real lifters.{" "}
        <span className="text-[var(--lime)]">Real results.</span>
      </h2>

      {/* Grid */}
      <div
        className="testimonials-grid grid gap-4"
        style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
      >
        {testimonials.map((t) => (
          <div
            key={t.name}
            className="rounded-[20px] border border-[var(--line-soft)] p-7"
            style={{ background: "rgba(255,255,255,0.025)" }}
          >
            {/* Stars */}
            <div className="mb-4 text-[var(--lime)]" style={{ fontSize: "16px", letterSpacing: "2px" }}>
              &#9733;&#9733;&#9733;&#9733;&#9733;
            </div>

            {/* Quote */}
            <blockquote
              className="mb-6 text-[16px] leading-[1.55] text-[var(--text)]"
              style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}
            >
              &ldquo;{t.quote}&rdquo;
            </blockquote>

            {/* Author */}
            <div className="flex items-center gap-3">
              <div
                className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-black"
                style={{ background: t.gradient }}
              >
                {t.initials}
              </div>
              <div>
                <p
                  className="text-[14px] font-bold text-[var(--text)]"
                  style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}
                >
                  {t.name}
                </p>
                <p
                  className="text-[11px] uppercase text-[var(--muted-2)]"
                  style={{ fontFamily: "var(--font-mono), monospace" }}
                >
                  {t.role}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .testimonials-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
