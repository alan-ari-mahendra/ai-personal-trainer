"use client";

/* ── Final CTA ─────────────────────────────────────────── */
export function FinalCTA() {
  return (
    <section className="final-cta-glow border-y border-[var(--line)] py-[140px] text-center">
      <div className="mx-auto max-w-[1280px] px-6">
        <h2
          className="uppercase"
          style={{
            fontFamily: "var(--font-display), system-ui, sans-serif",
            fontWeight: 800,
            fontSize: "clamp(56px, 9vw, 140px)",
            lineHeight: 0.9,
          }}
        >
          Stop{" "}
          <span
            style={{
              WebkitTextStroke: "1.5px white",
              color: "transparent",
            }}
          >
            guessing.
          </span>
          <br />
          Start{" "}
          <span className="text-[var(--lime)]">training.</span>
        </h2>

        <p
          className="mx-auto mt-6 max-w-[480px] text-[17px] leading-[1.7] text-[var(--muted)]"
          style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}
        >
          Join 10,000+ athletes already training with FORGEAI.
        </p>

        <a
          href="/register"
          className="mt-10 inline-block rounded-full bg-[var(--lime)] px-10 py-4 text-[16px] font-semibold text-black transition-opacity duration-200 hover:opacity-90"
          style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}
        >
          Start Free
        </a>
      </div>
    </section>
  );
}

/* ── Footer ────────────────────────────────────────────── */

const productLinks = ["Features", "Pricing", "Changelog", "Roadmap"];
const companyLinks = ["Blog", "Careers", "Press", "Contact"];
const legalLinks = ["Privacy", "Terms", "Cookies", "Security"];

export default function Footer() {
  return (
    <footer className="mx-auto max-w-[1280px] px-6 pb-8 pt-20">
      {/* Grid */}
      <div
        className="footer-grid grid gap-8"
        style={{ gridTemplateColumns: "1.5fr 1fr 1fr 1fr" }}
      >
        {/* Col 1: Brand */}
        <div>
          <a
            href="#"
            className="text-[20px] tracking-[-0.02em] text-[var(--text)]"
            style={{
              fontFamily: "var(--font-display), system-ui, sans-serif",
              fontWeight: 800,
            }}
          >
            FORGE<span className="text-[var(--lime)]">AI</span>
          </a>
          <p
            className="mt-3 max-w-[260px] text-[14px] leading-[1.6] text-[var(--muted)]"
            style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}
          >
            AI-powered personal training. Track workouts, nutrition, and
            recovery &mdash; all in one chat.
          </p>
          {/* Social icons */}
          <div className="mt-5 flex gap-2.5">
            {/* Instagram */}
            <a
              href="#"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--line)] text-[var(--muted)] transition-colors hover:border-[var(--muted-2)] hover:text-[var(--text)]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            {/* X / Twitter */}
            <a
              href="#"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--line)] text-[var(--muted)] transition-colors hover:border-[var(--muted-2)] hover:text-[var(--text)]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            {/* YouTube */}
            <a
              href="#"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--line)] text-[var(--muted)] transition-colors hover:border-[var(--muted-2)] hover:text-[var(--text)]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.43z" />
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
              </svg>
            </a>
          </div>
        </div>

        {/* Col 2: Product */}
        <div>
          <h4
            className="mb-4 text-[12px] uppercase tracking-[0.15em] text-[var(--muted-2)]"
            style={{ fontFamily: "var(--font-mono), monospace" }}
          >
            Product
          </h4>
          <ul className="flex flex-col gap-2.5">
            {productLinks.map((link) => (
              <li key={link}>
                <a
                  href="#"
                  className="text-[14px] text-[var(--muted)] transition-colors hover:text-[var(--text)]"
                  style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Company */}
        <div>
          <h4
            className="mb-4 text-[12px] uppercase tracking-[0.15em] text-[var(--muted-2)]"
            style={{ fontFamily: "var(--font-mono), monospace" }}
          >
            Company
          </h4>
          <ul className="flex flex-col gap-2.5">
            {companyLinks.map((link) => (
              <li key={link}>
                <a
                  href="#"
                  className="text-[14px] text-[var(--muted)] transition-colors hover:text-[var(--text)]"
                  style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 4: Legal */}
        <div>
          <h4
            className="mb-4 text-[12px] uppercase tracking-[0.15em] text-[var(--muted-2)]"
            style={{ fontFamily: "var(--font-mono), monospace" }}
          >
            Legal
          </h4>
          <ul className="flex flex-col gap-2.5">
            {legalLinks.map((link) => (
              <li key={link}>
                <a
                  href="#"
                  className="text-[14px] text-[var(--muted)] transition-colors hover:text-[var(--text)]"
                  style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-16 flex items-center justify-between border-t border-[var(--line)] pt-6">
        <span
          className="text-[13px] text-[var(--muted-2)]"
          style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}
        >
          &copy; 2026 FORGEAI Labs
        </span>
        <span
          className="text-[12px] text-[var(--muted-2)]"
          style={{ fontFamily: "var(--font-mono), monospace" }}
        >
          v1.4.2 &middot; Built for the iron
        </span>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
