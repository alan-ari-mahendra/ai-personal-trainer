"use client";

import { useEffect, useRef, useState } from "react";

/* ── ring config ─────────────────────────────────────────── */
const rings = [
  { label: "Calories", r: 88, sw: 14, dash: 552.92, pct: 0.836, cls: "ring-red", color: "var(--red)", current: "2,340", target: "2,800kcal" },
  { label: "Active",   r: 68, sw: 14, dash: 427.26, pct: 0.756, cls: "ring-lime", color: "var(--lime)", current: "68", target: "90min" },
  { label: "Recovery", r: 48, sw: 14, dash: 301.59, pct: 0.82,  cls: "ring-teal", color: "var(--teal)", current: "82", target: "%" },
];

export function Dashboard() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.25 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="mx-auto max-w-[1280px] px-6 py-24" ref={sectionRef}>
      {/* Label */}
      <p
        className="section-dash mb-4 text-[12px] uppercase tracking-[0.25em] text-[var(--muted)]"
        style={{ fontFamily: "var(--font-mono), monospace" }}
      >
        01 · Today&apos;s Overview
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
        A snapshot of your{" "}
        <span className="text-[var(--lime)]">entire day.</span>
      </h2>

      {/* Grid */}
      <div className="grid gap-5" style={{ gridTemplateColumns: "1.1fr 0.9fr" }}>
        {/* ── Left: Activity Card ─────────────────── */}
        <Card className="max-[959px]:col-span-full">
          {/* card header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p
                className="mb-1 text-[12px] uppercase tracking-[0.15em] text-[var(--muted-2)]"
                style={{ fontFamily: "var(--font-mono), monospace" }}
              >
                Activity
              </p>
              <h3
                className="text-[20px] text-[var(--text)]"
                style={{ fontFamily: "var(--font-display), system-ui, sans-serif", fontWeight: 700 }}
              >
                Wednesday, May 14
              </h3>
            </div>
            <span
              className="rounded-full border border-[var(--lime)] px-3 py-1 text-[11px] uppercase tracking-[0.1em] text-[var(--lime)]"
              style={{ fontFamily: "var(--font-mono), monospace" }}
            >
              On Track
            </span>
          </div>

          {/* inner grid: rings + stats */}
          <div className="grid grid-cols-2 items-center gap-6">
            {/* rings */}
            <div className="relative mx-auto aspect-square w-full max-w-[220px]">
              <svg viewBox="0 0 200 200" className="h-full w-full" style={{ transform: "rotate(-90deg)" }}>
                {rings.map((rng) => (
                  <g key={rng.label}>
                    {/* bg track */}
                    <circle
                      className="ring-bg"
                      cx={100} cy={100} r={rng.r}
                      fill="none"
                      strokeWidth={rng.sw}
                    />
                    {/* foreground */}
                    <circle
                      className={`ring-fg ${rng.cls}`}
                      cx={100} cy={100} r={rng.r}
                      fill="none"
                      strokeWidth={rng.sw}
                      strokeLinecap="round"
                      strokeDasharray={rng.dash}
                      strokeDashoffset={visible ? rng.dash * (1 - rng.pct) : rng.dash}
                      style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }}
                    />
                  </g>
                ))}
              </svg>
              {/* center overlay */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center"
                style={{ transform: "rotate(0deg)" }}
              >
                <span
                  className="text-[28px] text-[var(--text)]"
                  style={{ fontFamily: "var(--font-display), system-ui, sans-serif", fontWeight: 800 }}
                >
                  84%
                </span>
                <span
                  className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted-2)]"
                  style={{ fontFamily: "var(--font-mono), monospace" }}
                >
                  Daily Goal
                </span>
              </div>
            </div>

            {/* stats */}
            <div className="flex flex-col gap-5">
              {rings.map((rng) => (
                <div key={rng.label} className="flex items-start gap-3">
                  <span
                    className="mt-[6px] block h-[10px] w-[10px] shrink-0 rounded-full"
                    style={{ background: rng.color }}
                  />
                  <div>
                    <p
                      className="text-[13px] text-[var(--muted)]"
                      style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}
                    >
                      {rng.label}
                    </p>
                    <p
                      className="text-[18px] text-[var(--text)]"
                      style={{ fontFamily: "var(--font-display), system-ui, sans-serif", fontWeight: 700 }}
                    >
                      {rng.current}
                      <span className="text-[13px] text-[var(--muted-2)]">
                        /{rng.target}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* ── Right: 3 tiles ─────────────────────── */}
        <div className="flex flex-col gap-5 max-[959px]:col-span-full">
          {/* Streak */}
          <Card>
            <MiniLabel>Streak</MiniLabel>
            <p
              className="text-[36px] leading-none text-[var(--lime)]"
              style={{ fontFamily: "var(--font-display), system-ui, sans-serif", fontWeight: 800 }}
            >
              14 days
            </p>
            <p
              className="mt-2 text-[13px] text-[var(--muted)]"
              style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}
            >
              Personal record · keep going
            </p>
          </Card>

          {/* Calories */}
          <Card>
            <MiniLabel>Calories</MiniLabel>
            <p
              className="text-[36px] leading-none text-[var(--text)]"
              style={{ fontFamily: "var(--font-display), system-ui, sans-serif", fontWeight: 800 }}
            >
              2,340 <span className="text-[16px] text-[var(--muted-2)]">kcal</span>
            </p>
            <p
              className="mt-2 text-[13px] text-[var(--muted)]"
              style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}
            >
              +12% vs avg · 7-day
            </p>
          </Card>

          {/* Next Session */}
          <Card>
            <MiniLabel>Next Session</MiniLabel>
            <p
              className="text-[24px] leading-tight text-[var(--text)]"
              style={{ fontFamily: "var(--font-display), system-ui, sans-serif", fontWeight: 800 }}
            >
              Push Day A
            </p>
            <p
              className="mt-2 text-[13px] text-[var(--muted)]"
              style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}
            >
              Tomorrow · 07:00
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}

/* ── shared pieces ───────────────────────────────────────── */

function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={`rounded-[20px] border border-[var(--line-soft)] p-7 backdrop-blur-[12px] ${className}`}
      style={{ background: "rgba(255,255,255,0.03)" }}
    >
      {children}
    </div>
  );
}

function MiniLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mb-3 text-[12px] uppercase tracking-[0.15em] text-[var(--muted-2)]"
      style={{ fontFamily: "var(--font-mono), monospace" }}
    >
      {children}
    </p>
  );
}
