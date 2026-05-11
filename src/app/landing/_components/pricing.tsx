"use client";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    featured: false,
    features: [
      "Basic workout tracking",
      "10 AI messages/day",
      "1 active program",
      "Manual logging",
    ],
    cta: "Start Free",
    ctaStyle: "ghost" as const,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    featured: true,
    badge: "Most Popular",
    features: [
      "Unlimited AI chat",
      "Full nutrition intelligence",
      "Progress analytics & PRs",
      "Unlimited custom programs",
      "Recovery monitoring",
    ],
    cta: "Start Free",
    ctaStyle: "primary" as const,
  },
  {
    name: "Team",
    price: "$49",
    period: "/month",
    featured: false,
    features: [
      "Everything in Pro",
      "Coach dashboard",
      "Manage multiple clients",
      "Team analytics & reports",
    ],
    cta: "Contact Sales",
    ctaStyle: "ghost" as const,
  },
];

export function Pricing() {
  return (
    <section className="mx-auto max-w-[1280px] px-6 py-24">
      {/* Label */}
      <p
        className="section-dash mb-4 flex items-center gap-3 text-[12px] uppercase tracking-[0.25em] text-[var(--muted)]"
        style={{ fontFamily: "var(--font-mono-landing), monospace" }}
      >
        06 &middot; Pricing
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
        Simple pricing.{" "}
        <span className="text-[var(--lime)]">No BS.</span>
      </h2>

      {/* Grid */}
      <div
        className="pricing-grid grid items-stretch gap-4"
        style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
      >
        {plans.map((plan) => (
          <div
            key={plan.name}
            className="relative flex flex-col rounded-[20px] border bg-[var(--surface-1)] p-8"
            style={{
              borderColor: plan.featured ? "var(--lime)" : "var(--line)",
              backgroundImage: plan.featured
                ? "linear-gradient(180deg, rgba(232,255,60,0.06) 0%, transparent 40%)"
                : undefined,
            }}
          >
            {/* Badge */}
            {plan.badge && (
              <span
                className="absolute left-1/2 -translate-x-1/2 rounded-full bg-[var(--lime)] px-4 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-black"
                style={{
                  top: "-12px",
                  fontFamily: "var(--font-mono-landing), monospace",
                }}
              >
                {plan.badge}
              </span>
            )}

            {/* Plan label */}
            <p
              className="mb-4 text-[12px] uppercase tracking-[0.15em] text-[var(--muted-2)]"
              style={{ fontFamily: "var(--font-mono-landing), monospace" }}
            >
              {plan.name}
            </p>

            {/* Price */}
            <div className="mb-6 flex items-baseline gap-1">
              <span
                style={{
                  fontFamily: "var(--font-display), system-ui, sans-serif",
                  fontWeight: 800,
                  fontSize: "56px",
                  lineHeight: 1,
                  color: "var(--text)",
                }}
              >
                {plan.price}
              </span>
              <span
                className="text-[15px] text-[var(--muted-2)]"
                style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}
              >
                {plan.period}
              </span>
            </div>

            {/* Features */}
            <ul className="mb-8 flex flex-1 flex-col gap-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <span
                    className="mt-[3px] text-[14px] text-[var(--lime)]"
                    style={{ fontFamily: "var(--font-mono-landing), monospace" }}
                  >
                    +
                  </span>
                  <span
                    className="text-[14px] text-[var(--muted)]"
                    style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}
                  >
                    {f}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <a
              href="#"
              className={`mt-auto block rounded-full py-3 text-center text-[15px] font-semibold transition-opacity duration-200 hover:opacity-90 ${
                plan.ctaStyle === "primary"
                  ? "bg-[var(--lime)] text-black"
                  : "border border-[var(--line)] text-[var(--text)]"
              }`}
              style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}
            >
              {plan.cta}
            </a>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .pricing-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
