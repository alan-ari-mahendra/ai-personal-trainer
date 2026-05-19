// onboarding.jsx — Aethra 5-step onboarding (mobile-first, in iOS frame)

const ONB_DEFAULTS = /*EDITMODE-BEGIN*/{
  "step": 0,
  "showAll": false,
  "view": "mobile"
}/*EDITMODE-END*/;

// ── Icons (lucide-styled, 1.5 stroke) ────────────────────────────────────────
const Ico = {
  shield: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  bars:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
  leaf:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 4c0 8-5 14-13 14a8 8 0 0 1-3-1c0-8 6-13 13-13h3z"/><path d="M4 20c4-6 9-9 13-10"/></svg>,
  trend:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>,
  flame:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 2c1 4 5 5 5 10a5 5 0 1 1-10 0c0-2 1-3 2-4 0 2 1 3 3 3-2-3 0-6 0-9z"/></svg>,
  moon:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>,
  activity:(p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  sparkle:(p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></svg>,
  back:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M19 12H5"/><path d="m11 18-6-6 6-6"/></svg>,
  check:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12l5 5L20 7"/></svg>,
  chevD:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m6 9 6 6 6-6"/></svg>,
};

// ── Logo ────────────────────────────────────────────────────────────────────
function Mark({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="onbm" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--gold)"/>
          <stop offset="100%" stopColor="var(--gold-deep)"/>
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="14" stroke="url(#onbm)" strokeWidth="1.2" opacity=".55"/>
      <path d="M16 4 C 9 12, 9 20, 16 28 C 23 20, 23 12, 16 4 Z" stroke="url(#onbm)" strokeWidth="1.3" fill="none"/>
      <circle cx="16" cy="16" r="2" fill="var(--gold)"/>
    </svg>
  );
}

// ── Atmospheric background (inside device screen) ───────────────────────────
function ScreenAtmo({ vivid = false }) {
  return (
    <div className="screen-atmo" aria-hidden="true">
      <div className="screen-atmo-base" />
      <div className="screen-atmo-gold" style={{ opacity: vivid ? 0.95 : 0.7 }} />
      <div className="screen-atmo-sage" style={{ opacity: vivid ? 0.85 : 0.6 }} />
      <div className="screen-atmo-stars">
        {Array.from({ length: 28 }).map((_, i) => {
          const seed = (i * 9301 + 49297) % 233280;
          const x = (seed % 1000) / 10;
          const y = ((seed * 13) % 800) / 10;
          const r = 0.4 + ((seed % 14) / 14);
          const a = 0.3 + ((seed % 7) / 7) * 0.6;
          return <span key={i} className="screen-star" style={{ left: `${x}%`, top: `${y}%`, width: r, height: r, opacity: a, animationDelay: `${(seed % 40) / 10}s` }} />;
        })}
      </div>
    </div>
  );
}

// ── Progress dots ───────────────────────────────────────────────────────────
function ProgressDots({ step, total = 5 }) {
  return (
    <div className="ob-progress" role="progressbar" aria-valuenow={step+1} aria-valuemax={total}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={"ob-dot " + (i < step ? "is-done" : i === step ? "is-now" : "")} />
      ))}
    </div>
  );
}

// ── Primary / ghost buttons ─────────────────────────────────────────────────
function PrimaryBtn({ children, onClick, disabled }) {
  return (
    <button className="ob-pri" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
function BackBtn({ onClick, label = "Back" }) {
  return (
    <button className="ob-back" onClick={onClick}>
      <Ico.back width="14" height="14" /> {label}
    </button>
  );
}

// ── STEP 1 — Welcome ────────────────────────────────────────────────────────
function StepWelcome({ data, setData, onNext }) {
  return (
    <div className="ob-step ob-step--welcome">
      <div className="ob-step-body">
        <div className="ob-mark-large"><Mark size={44} /></div>
        <h1 className="ob-h1">Welcome to Aethra.</h1>
        <p className="ob-sub">Let's take 2 minutes to calibrate your experience.</p>

        <label className="ob-field ob-field--single">
          <span className="ob-field-l">What should I call you?</span>
          <input
            className="ob-input"
            type="text"
            value={data.name}
            onChange={(e) => setData({ name: e.target.value })}
            placeholder="Your first name"
            autoFocus
          />
        </label>
      </div>
      <div className="ob-foot">
        <PrimaryBtn onClick={onNext} disabled={!data.name?.trim()}>Let's Begin</PrimaryBtn>
      </div>
    </div>
  );
}

// ── STEP 2 — Physical Baseline ──────────────────────────────────────────────
function StepBaseline({ data, setData, onNext, onBack }) {
  const setUnit = (k, v) => setData({ [k]: v });
  return (
    <div className="ob-step">
      <div className="ob-step-body">
        <h2 className="ob-h2">A few numbers to<br/>calibrate your insights.</h2>
        <p className="ob-sub">These help Aethra set accurate nutrition and recovery targets.</p>

        <div className="ob-form">
          <div className="ob-row">
            <label className="ob-field">
              <span className="ob-field-l">Age</span>
              <input className="ob-input" type="number" inputMode="numeric"
                     value={data.age} onChange={(e) => setData({ age: e.target.value })} placeholder="28" />
            </label>
            <label className="ob-field">
              <span className="ob-field-l">Biological sex</span>
              <SegSmall value={data.sex} options={["Male","Female","Other"]} onChange={(v) => setData({ sex: v })} />
            </label>
          </div>

          <div className="ob-row">
            <label className="ob-field">
              <span className="ob-field-l">Height</span>
              <div className="ob-unit">
                <input className="ob-input" type="number" inputMode="numeric"
                       value={data.height} onChange={(e) => setData({ height: e.target.value })}
                       placeholder={data.heightUnit === "cm" ? "178" : "5'10\""} />
                <UnitToggle value={data.heightUnit} options={["cm","ft"]} onChange={(v) => setUnit("heightUnit", v)} />
              </div>
            </label>
            <label className="ob-field">
              <span className="ob-field-l">Weight</span>
              <div className="ob-unit">
                <input className="ob-input" type="number" inputMode="numeric"
                       value={data.weight} onChange={(e) => setData({ weight: e.target.value })}
                       placeholder={data.weightUnit === "kg" ? "78" : "172"} />
                <UnitToggle value={data.weightUnit} options={["kg","lbs"]} onChange={(v) => setUnit("weightUnit", v)} />
              </div>
            </label>
          </div>

          <label className="ob-field">
            <span className="ob-field-l">Activity level</span>
            <Select value={data.activity} options={["Sedentary","Light","Moderate","Active","Very Active"]}
                    onChange={(v) => setData({ activity: v })} />
          </label>
        </div>

        <p className="ob-note">You can update these anytime in your profile.</p>
      </div>
      <div className="ob-foot">
        <PrimaryBtn onClick={onNext}>Continue</PrimaryBtn>
        <BackBtn onClick={onBack} />
      </div>
    </div>
  );
}

function SegSmall({ value, options, onChange }) {
  return (
    <div className="ob-seg">
      {options.map(o => (
        <button key={o} className={o === value ? "is-on" : ""} onClick={() => onChange(o)}>{o}</button>
      ))}
    </div>
  );
}

function UnitToggle({ value, options, onChange }) {
  return (
    <div className="ob-unit-toggle">
      {options.map(o => (
        <button key={o} className={o === value ? "is-on" : ""} onClick={() => onChange(o)}>{o}</button>
      ))}
    </div>
  );
}

function Select({ value, options, onChange }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className={"ob-select " + (open ? "is-open" : "")}>
      <button className="ob-select-btn" onClick={() => setOpen(o => !o)}>
        <span>{value}</span>
        <Ico.chevD width="16" height="16" />
      </button>
      {open && (
        <div className="ob-select-list">
          {options.map(o => (
            <button key={o} onClick={() => { onChange(o); setOpen(false); }} className={o === value ? "is-on" : ""}>
              {o}
              {o === value && <Ico.check width="14" height="14" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── STEP 3 — Primary Goal ───────────────────────────────────────────────────
const GOALS = [
  { id: "muscle",   icon: "trend",    title: "Build Muscle",      blurb: "Optimize training volume and protein targets" },
  { id: "fat",      icon: "flame",    title: "Lose Body Fat",     blurb: "Manage calorie deficit without sacrificing recovery" },
  { id: "recover",  icon: "moon",     title: "Improve Recovery",  blurb: "Prioritize rest, sleep, and mental clarity" },
  { id: "balance",  icon: "activity", title: "General Balance",   blurb: "No specific goal. Just stay consistent and feel good." },
];

function StepGoal({ data, setData, onNext, onBack }) {
  const choose = (id) => setData({ goal: id });
  return (
    <div className="ob-step">
      <div className="ob-step-body">
        <h2 className="ob-h2">What brings you<br/>to Aethra?</h2>
        <p className="ob-sub">Your coach will prioritize insights around this goal.</p>

        <div className="ob-goal-grid">
          {GOALS.map(g => {
            const Icon = Ico[g.icon];
            const active = data.goal === g.id;
            return (
              <button key={g.id} className={"ob-goal " + (active ? "is-active" : "")} onClick={() => choose(g.id)}>
                <span className="ob-goal-icon"><Icon width="20" height="20" /></span>
                <span className="ob-goal-title">{g.title}</span>
                <span className="ob-goal-blurb">{g.blurb}</span>
                {active && <span className="ob-goal-check"><Ico.check width="12" height="12" /></span>}
              </button>
            );
          })}
        </div>
      </div>
      <div className="ob-foot">
        <PrimaryBtn onClick={onNext} disabled={!data.goal}>This Is My Goal</PrimaryBtn>
        <BackBtn onClick={onBack} />
      </div>
    </div>
  );
}

// ── STEP 4 — Personality (HERO) ─────────────────────────────────────────────
const PERSONAS = [
  {
    id: "strict",     icon: "shield", tone: "warmred", hex: "#e07b7b",
    title: "The Strict Coach",
    quote: "Numbers don't lie. Neither will I.",
    desc:  "Direct, metric-driven, no filler. Calls out inconsistency. Best for goal-focused users who want accountability over comfort.",
    sample: "You skipped yesterday's session and your calorie intake dropped 400 below target. This is a pattern. Let's address it.",
  },
  {
    id: "analytical", icon: "bars", tone: "gold", hex: "#e8c275",
    title: "The Analytical Coach",
    quote: "Let's look at the data and find the pattern.",
    desc:  "Data-first, pattern-focused. Surfaces correlations and trends. Best for users who want to understand the why behind every recommendation.",
    sample: "Your training volume increased 22% this week but recovery score dropped 14 points. The correlation suggests accumulated fatigue. Consider a deload.",
    recommended: true,
  },
  {
    id: "calm",       icon: "leaf", tone: "sage", hex: "#8fb89b",
    title: "The Calm Guide",
    quote: "Wellness is a marathon. I will keep you steady.",
    desc:  "Gentle, encouraging, recovery-aware. Celebrates consistency over intensity. Best for users building long-term habits or returning from a break.",
    sample: "Three consistent days in a row. That is exactly the foundation that builds lasting progress. Tomorrow, rest is part of the plan.",
  },
];

function StepPersonality({ data, setData, onNext, onBack }) {
  return (
    <div className="ob-step">
      <div className="ob-step-body ob-step-body--scroll">
        <h2 className="ob-h2">Choose your coach.</h2>
        <p className="ob-sub ob-sub--bright">Same insights. Different voice. You can change this later.</p>

        <div className="ob-personas">
          {PERSONAS.map(p => {
            const Icon = Ico[p.icon];
            const active = data.personality === p.id;
            return (
              <button key={p.id}
                      className={"ob-persona ob-persona--" + p.tone + (active ? " is-active" : "")}
                      onClick={() => setData({ personality: p.id })}>
                <div className="ob-persona-hd">
                  <span className="ob-persona-icon"><Icon width="22" height="22" /></span>
                  {active ? (
                    <span className="ob-persona-badge ob-persona-badge--selected">
                      <Ico.check width="11" height="11" /> Selected
                    </span>
                  ) : p.recommended ? (
                    <span className="ob-persona-badge">Recommended</span>
                  ) : null}
                </div>
                <div className="ob-persona-title">{p.title}</div>
                <div className="ob-persona-quote">"{p.quote}"</div>
                <p className="ob-persona-desc">{p.desc}</p>
                <div className="ob-persona-sample">
                  <div className="ob-persona-sample-hd">Sample insight</div>
                  <p>{p.sample}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="ob-foot">
        <PrimaryBtn onClick={onNext} disabled={!data.personality}>This Is My Coach</PrimaryBtn>
        <BackBtn onClick={onBack} />
      </div>
    </div>
  );
}

// ── STEP 5 — Ready ──────────────────────────────────────────────────────────
function StepReady({ data, onBack }) {
  const persona = PERSONAS.find(p => p.id === data.personality) || PERSONAS[1];
  const name = (data.name || "").trim();
  return (
    <div className="ob-step ob-step--ready">
      <div className="ob-step-body ob-step-body--center">
        <div className="ob-ready-spark"><Ico.sparkle width="22" height="22" /></div>
        <h1 className="ob-h1 ob-h1--gold">Aethra is ready{name ? `, ${name}` : ""}.</h1>
        <p className="ob-sub ob-sub--bright">
          Your <strong>{persona.title.replace("The ","")}</strong> is calibrated to your profile.
          Let's start building your picture.
        </p>

        <div className="ob-pillars-preview">
          {["Nutrition", "Training", "Recovery"].map(label => (
            <div key={label} className="ob-pillar-chip">
              <span className="ob-pillar-tick"><Ico.check width="10" height="10" /></span>
              {label}
            </div>
          ))}
        </div>
      </div>
      <div className="ob-foot">
        <PrimaryBtn onClick={() => alert("Heading to your dashboard…")}>Open My Dashboard</PrimaryBtn>
        <button className="ob-ghost" onClick={() => alert("Quick tour coming up…")}>Take the quick tour first</button>
      </div>
    </div>
  );
}

// ── Step shell — header (logo + progress) + step body ──────────────────────
function StepShell({ step, total, children, atmoVivid, desktop }) {
  return (
    <div className={"ob-shell " + (desktop ? "ob-shell--desktop" : "")}>
      {!desktop && <ScreenAtmo vivid={atmoVivid} />}
      <div className="ob-header">
        <div className="ob-header-mark"><Mark size={desktop ? 28 : 20} /></div>
        <ProgressDots step={step} total={total} />
      </div>
      <div className="ob-step-stage">{children}</div>
    </div>
  );
}

// ── Single device with active step ─────────────────────────────────────────
function OnboardingDevice({ step, setStep, data, setData, view }) {
  const total = 5;
  const go = (n) => setStep(Math.max(0, Math.min(total - 1, n)));
  const next = () => go(step + 1);
  const back = () => go(step - 1);
  const [scale, setScale] = React.useState(1);
  const isMobile  = view === "mobile";
  const isDesktop = view === "desktop";

  React.useLayoutEffect(() => {
    function fit() {
      if (isDesktop) { setScale(1); return; }
      const cellH = window.innerHeight - 180;
      const deviceH = 844;
      setScale(Math.min(1, cellH / deviceH));
    }
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [view]);

  const stepView = (() => {
    switch (step) {
      case 0: return <StepWelcome     data={data} setData={setData} onNext={next} />;
      case 1: return <StepBaseline    data={data} setData={setData} onNext={next} onBack={back} />;
      case 2: return <StepGoal        data={data} setData={setData} onNext={next} onBack={back} />;
      case 3: return <StepPersonality data={data} setData={setData} onNext={next} onBack={back} />;
      case 4: return <StepReady       data={data} onBack={back} />;
      default: return null;
    }
  })();

  const shell = (
    <StepShell step={step} total={total} atmoVivid={step === 4} desktop={isDesktop}>
      {stepView}
    </StepShell>
  );

  if (isDesktop) {
    return <div className="ob-desktop-card">{shell}</div>;
  }

  // Mobile: iPhone frame
  return (
    <div className="ob-device-outer" style={{ width: 390 * scale, height: 844 * scale }}>
      <div className="ob-device-scaler"
           style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
        <IOSDevice dark={true} width={390} height={844}>{shell}</IOSDevice>
      </div>
    </div>
  );
}

// ── All-steps canvas mode ──────────────────────────────────────────────────
function AllStepsCanvas({ data, setData, view }) {
  return (
    <div className={"ob-canvas " + (view === "desktop" ? "ob-canvas--desktop" : "")}>
      {[0,1,2,3,4].map((s) => (
        <div key={s} className="ob-canvas-cell">
          <div className="ob-canvas-label">STEP {s+1}</div>
          <OnboardingDevice step={s} setStep={() => {}} data={data} setData={setData} view={view} />
        </div>
      ))}
    </div>
  );
}

// ── Root ────────────────────────────────────────────────────────────────────
function App() {
  const [t, setTweak] = useTweaks(ONB_DEFAULTS);
  const [data, setDataRaw] = React.useState({
    name: "",
    age: "", sex: "",
    height: "", heightUnit: "cm",
    weight: "", weightUnit: "kg",
    activity: "Moderate",
    goal: "",
    personality: "analytical",
  });
  const setData = (patch) => setDataRaw(d => ({ ...d, ...patch }));

  return (
    <div className="ob-page">
      <PageBackdrop />
      <header className="ob-top">
        <a href="Aethra Landing v2.html" className="ob-top-link">← Back to landing</a>
        <span className="ob-top-title">Aethra · Onboarding prototype</span>
        <a href="Aethra Landing.html" className="ob-top-link">v1</a>
      </header>

      <main className={"ob-stage ob-stage--" + t.view}>
        {t.showAll
          ? <AllStepsCanvas data={data} setData={setData} view={t.view} />
          : <OnboardingDevice
              step={t.step}
              setStep={(n) => setTweak("step", n)}
              data={data}
              setData={setData}
              view={t.view}
            />}
      </main>

      <TweaksPanel>
        <TweakSection label="View" />
        <TweakRadio label="Layout" value={t.view}
                    options={["mobile", "desktop"]}
                    onChange={(v) => setTweak("view", v)} />
        <TweakSection label="Flow" />
        <TweakSlider label="Step" value={t.step} min={0} max={4} step={1}
                     onChange={(v) => setTweak("step", v)} />
        <TweakToggle label="Show all steps" value={t.showAll}
                     onChange={(v) => setTweak("showAll", v)} />
      </TweaksPanel>
    </div>
  );
}

function PageBackdrop() {
  return (
    <div className="ob-backdrop" aria-hidden="true">
      <div className="ob-backdrop-base" />
      <div className="ob-backdrop-bloom ob-backdrop-bloom--gold" />
      <div className="ob-backdrop-bloom ob-backdrop-bloom--sage" />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
