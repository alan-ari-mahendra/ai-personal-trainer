"use client";

export function Navbar() {
  return (
    <nav
      className="sticky top-0 z-50 w-full border-b border-[var(--line-soft)] backdrop-blur-xl"
      style={{ background: "rgba(10, 10, 10, 0.8)" }}
    >
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5">
          <span
            className="block h-[10px] w-[10px] rounded-sm bg-[var(--lime)]"
            style={{ boxShadow: "0 0 10px rgba(232, 255, 60, 0.6)" }}
          />
          <span
            className="text-[15px] tracking-[0.2em] text-[var(--text)]"
            style={{
              fontFamily: "var(--font-display), system-ui, sans-serif",
              fontWeight: 800,
            }}
          >
            FORGEAI
          </span>
        </a>

        {/* Nav Links — hidden below 960px via landing.css */}
        <div
          className="landing-nav-links flex items-center gap-8"
        >
          {["Features", "How It Works", "Pricing", "Login"].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-[13px] tracking-[0.05em] text-[var(--muted)] transition-colors duration-200 hover:text-[var(--text)]"
              style={{
                fontFamily: "var(--font-body), system-ui, sans-serif",
              }}
            >
              {label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <a
          href="#"
          className="rounded-full bg-[var(--lime)] px-5 py-2 text-[13px] font-semibold text-black transition-opacity duration-200 hover:opacity-90"
          style={{
            fontFamily: "var(--font-body), system-ui, sans-serif",
          }}
        >
          Start Free
        </a>
      </div>
    </nav>
  );
}
