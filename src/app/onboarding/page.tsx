'use client';

import { useState, useCallback, type ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import { defineStepper } from '@stepperize/react';
import {
  User,
  Ruler,
  Target,
  ClipboardList,
  CheckCircle,
  TrendingUp,
  Flame,
  Moon,
  Activity,
  Check,
  Sparkles,
  Loader2,
  type LucideProps,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { saveOnboarding } from '@/lib/actions/onboarding';

// ── Types ───────────────────────────────────────────────────────────────────

interface FormData {
  display_name: string;
  gender: string;
  age: string;
  height_cm: string;
  weight_kg: string;
  goal: string;
  activity_level: string;
  exercise_history: string;
  injuries: string;
  address: string;
}

const EMPTY: FormData = {
  display_name: '',
  gender: '',
  age: '',
  height_cm: '',
  weight_kg: '',
  goal: '',
  activity_level: '',
  exercise_history: '',
  injuries: '',
  address: '',
};

// ── Stepper definition ──────────────────────────────────────────────────────

const { useStepper, steps } = defineStepper(
  { id: 'welcome', title: 'Profil' },
  { id: 'baseline', title: 'Data Fisik' },
  { id: 'goal', title: 'Goal' },
  { id: 'history', title: 'Riwayat' },
  { id: 'ready', title: 'Selesai' },
);

const STEP_ICONS: Record<string, ComponentType<LucideProps>> = {
  welcome: User,
  baseline: Ruler,
  goal: Target,
  history: ClipboardList,
  ready: CheckCircle,
};

// ── Goal options ────────────────────────────────────────────────────────────

const GOALS = [
  {
    id: 'cutting',
    icon: Flame,
    title: 'Cutting',
    desc: 'Defisit kalori terkontrol, jaga massa otot tetap maksimal',
  },
  {
    id: 'bulking',
    icon: TrendingUp,
    title: 'Bulking',
    desc: 'Surplus kalori + volume latihan buat nambah massa otot',
  },
  {
    id: 'maintenance',
    icon: Activity,
    title: 'Maintenance',
    desc: 'Jaga kondisi, konsisten, dan tetap sehat sehari-hari',
  },
  {
    id: 'health',
    icon: Moon,
    title: 'Health & Recovery',
    desc: 'Fokus istirahat, pemulihan, dan kesehatan jangka panjang',
  },
] as const;

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary' },
  { value: 'light', label: 'Light' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'active', label: 'Active' },
  { value: 'very_active', label: 'Very Active' },
] as const;

const GENDERS = [
  { value: 'male', label: 'Pria' },
  { value: 'female', label: 'Wanita' },
  { value: 'other', label: 'Lainnya' },
] as const;

// ── Stepper bar (horizontal icons + labels) ─────────────────────────────────

function StepperBar({ currentIndex }: { currentIndex: number }) {
  return (
    <div className="flex items-center justify-between px-6 py-5 sm:px-10">
      {steps.map((step, i) => {
        const Icon = STEP_ICONS[step.id];
        const isDone = i < currentIndex;
        const isActive = i === currentIndex;

        return (
          <div key={step.id} className="flex flex-col items-center gap-2">
            <div
              className={`flex size-10 items-center justify-center rounded-full transition-all ${
                isActive
                  ? 'bg-lime-400 text-black shadow-[0_0_16px_rgba(163,230,53,0.35)]'
                  : isDone
                    ? 'bg-lime-400/20 text-lime-400'
                    : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {isDone ? (
                <Check className="size-4" strokeWidth={2.5} />
              ) : (
                <Icon className="size-4" />
              )}
            </div>
            <span
              className={`text-xs font-medium transition-colors ${
                isActive
                  ? 'text-zinc-100'
                  : isDone
                    ? 'text-lime-400/70'
                    : 'text-zinc-500'
              }`}
            >
              {step.title}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Step content components ─────────────────────────────────────────────────

function StepWelcome({
  data,
  update,
}: {
  data: FormData;
  update: (k: keyof FormData, v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-zinc-100">
          Welcome to FitAI
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          2 menit aja buat setup profil kamu.
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-zinc-200">
          Nama Tampilan
        </Label>
        <Input
          value={data.display_name}
          onChange={(e) => update('display_name', e.target.value)}
          placeholder="Mau dipanggil apa?"
          autoFocus
          className="h-11 rounded-lg border-zinc-800 bg-zinc-900/80 placeholder:text-zinc-600 focus-visible:border-lime-500/50 focus-visible:ring-lime-500/20"
        />
      </div>
    </div>
  );
}

function StepBaseline({
  data,
  update,
}: {
  data: FormData;
  update: (k: keyof FormData, v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-zinc-100">Data Fisik</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Buat kalkulasi nutrisi dan target yang akurat.
        </p>
      </div>

      {/* Gender */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-zinc-200">
          Jenis Kelamin
        </Label>
        <div className="flex gap-2">
          {GENDERS.map((g) => (
            <button
              key={g.value}
              type="button"
              onClick={() => update('gender', g.value)}
              className={`rounded-full border px-5 py-2 text-sm font-medium transition-all ${
                data.gender === g.value
                  ? 'border-lime-400 bg-lime-400/10 text-lime-400'
                  : 'border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Age + Height + Weight */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-zinc-200">Umur</Label>
          <div className="relative">
            <Input
              type="number"
              inputMode="numeric"
              value={data.age}
              onChange={(e) => update('age', e.target.value)}
              placeholder="28"
              className="h-11 rounded-lg border-zinc-800 bg-zinc-900/80 pr-14 placeholder:text-zinc-600 focus-visible:border-lime-500/50 focus-visible:ring-lime-500/20"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-600">
              tahun
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-zinc-200">Tinggi</Label>
          <div className="relative">
            <Input
              type="number"
              inputMode="numeric"
              value={data.height_cm}
              onChange={(e) => update('height_cm', e.target.value)}
              placeholder="170"
              className="h-11 rounded-lg border-zinc-800 bg-zinc-900/80 pr-10 placeholder:text-zinc-600 focus-visible:border-lime-500/50 focus-visible:ring-lime-500/20"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-600">
              cm
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-zinc-200">Berat</Label>
          <div className="relative">
            <Input
              type="number"
              inputMode="numeric"
              value={data.weight_kg}
              onChange={(e) => update('weight_kg', e.target.value)}
              placeholder="70"
              className="h-11 rounded-lg border-zinc-800 bg-zinc-900/80 pr-10 placeholder:text-zinc-600 focus-visible:border-lime-500/50 focus-visible:ring-lime-500/20"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-600">
              kg
            </span>
          </div>
        </div>
      </div>

      {/* Activity level */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-zinc-200">
          Level Aktivitas
        </Label>
        <div className="flex flex-wrap gap-2">
          {ACTIVITY_LEVELS.map((a) => (
            <button
              key={a.value}
              type="button"
              onClick={() => update('activity_level', a.value)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                data.activity_level === a.value
                  ? 'border-lime-400 bg-lime-400/10 text-lime-400'
                  : 'border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepGoal({
  data,
  update,
}: {
  data: FormData;
  update: (k: keyof FormData, v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-zinc-100">
          Apa tujuan fitness kamu?
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          AI coach bakal prioritasin insight seputar goal ini.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {GOALS.map((g) => {
          const Icon = g.icon;
          const active = data.goal === g.id;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => update('goal', g.id)}
              className={`group relative rounded-xl border p-4 text-left transition-all ${
                active
                  ? 'border-lime-400/60 bg-lime-400/5'
                  : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <span
                  className={`inline-flex size-9 items-center justify-center rounded-lg ${
                    active
                      ? 'bg-lime-400/15 text-lime-400'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  <Icon className="size-4" />
                </span>
                {active && (
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-lime-400 text-black">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                )}
              </div>
              <div
                className={`mt-2.5 text-sm font-semibold ${active ? 'text-lime-400' : 'text-zinc-200'}`}
              >
                {g.title}
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
                {g.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepHistory({
  data,
  update,
}: {
  data: FormData;
  update: (k: keyof FormData, v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-zinc-100">
          Ada yang perlu kita tahu?
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Semua opsional — bisa diisi nanti di profil.
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-zinc-200">
          Riwayat Olahraga
        </Label>
        <textarea
          value={data.exercise_history}
          onChange={(e) => update('exercise_history', e.target.value)}
          placeholder="Contoh: Gym 2 tahun, sekarang vakum 3 bulan..."
          rows={3}
          className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-900/80 px-4 py-3 text-sm text-foreground placeholder:text-zinc-600 outline-none transition-colors focus-visible:border-lime-500/50 focus-visible:ring-1 focus-visible:ring-lime-500/20"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-zinc-200">
          Cedera / Limitasi
        </Label>
        <textarea
          value={data.injuries}
          onChange={(e) => update('injuries', e.target.value)}
          placeholder="Tulis jika ada, atau kosongkan"
          rows={3}
          className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-900/80 px-4 py-3 text-sm text-foreground placeholder:text-zinc-600 outline-none transition-colors focus-visible:border-lime-500/50 focus-visible:ring-1 focus-visible:ring-lime-500/20"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-zinc-200">Alamat</Label>
        <Input
          value={data.address}
          onChange={(e) => update('address', e.target.value)}
          placeholder="Kota / daerah tempat tinggal"
          className="h-11 rounded-lg border-zinc-800 bg-zinc-900/80 placeholder:text-zinc-600 focus-visible:border-lime-500/50 focus-visible:ring-lime-500/20"
        />
      </div>
    </div>
  );
}

function StepReady({ data }: { data: FormData }) {
  const name = data.display_name.trim();
  const goalLabel = GOALS.find((g) => g.id === data.goal)?.title ?? 'Fitness';

  return (
    <div className="flex flex-col items-center py-8 text-center">
      <div className="mb-5 inline-flex size-14 items-center justify-center rounded-2xl bg-lime-400/10 text-lime-400">
        <Sparkles className="size-7" />
      </div>

      <h2 className="text-lg font-bold text-zinc-100">
        FitAI siap{name ? `, ${name}` : ''}!
      </h2>
      <p className="mt-2 max-w-sm text-sm text-zinc-500">
        Profil kamu udah di-setup. AI coach siap bantu kamu capai target{' '}
        <span className="font-medium text-lime-400">{goalLabel}</span>.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {[
          data.goal && goalLabel,
          data.activity_level &&
            ACTIVITY_LEVELS.find((a) => a.value === data.activity_level)?.label,
          data.weight_kg && `${data.weight_kg} kg`,
          data.height_cm && `${data.height_cm} cm`,
        ]
          .filter(Boolean)
          .map((chip) => (
            <span
              key={chip}
              className="inline-flex items-center gap-1.5 rounded-full border border-lime-400/20 bg-lime-400/5 px-3 py-1.5 text-xs font-medium text-lime-400"
            >
              <Check className="size-3" />
              {chip}
            </span>
          ))}
      </div>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const stepper = useStepper();
  const [formData, setFormData] = useState<FormData>(EMPTY);
  const [saving, setSaving] = useState(false);

  const update = useCallback((key: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const currentIndex = stepper.state.current.index;

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await saveOnboarding({
        display_name: formData.display_name || null,
        gender: formData.gender || null,
        age: formData.age ? Number(formData.age) : null,
        height_cm: formData.height_cm ? Number(formData.height_cm) : null,
        weight_kg: formData.weight_kg ? Number(formData.weight_kg) : null,
        goal: formData.goal || 'maintenance',
        activity_level: formData.activity_level || 'moderate',
        exercise_history: formData.exercise_history || null,
        injuries: formData.injuries || null,
        address: formData.address || null,
      });
      router.push('/chat');
    } catch (error) {
      console.error('Failed to save onboarding:', error);
    } finally {
      setSaving(false);
    }
  }, [formData, router]);

  const handleSkip = useCallback(async () => {
    setSaving(true);
    try {
      await saveOnboarding({
        display_name: null,
        gender: null,
        age: null,
        height_cm: null,
        weight_kg: null,
        goal: 'maintenance',
        activity_level: 'moderate',
        exercise_history: null,
        injuries: null,
        address: null,
      });
      router.push('/chat');
    } catch (error) {
      console.error('Failed to skip onboarding:', error);
    } finally {
      setSaving(false);
    }
  }, [router]);

  // Disable "Next" on steps that require input
  const isNextDisabled =
    (stepper.state.current.data.id === 'welcome' &&
      !formData.display_name.trim()) ||
    (stepper.state.current.data.id === 'goal' && !formData.goal);

  const isLastStep = stepper.state.isLast;
  const isFirstStep = stepper.state.isFirst;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-4 py-10">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime-400/[0.04] blur-[120px]" />
      </div>

      {/* Title area */}
      <div className="relative z-10 mb-8 text-center">
        <div className="mb-4 flex items-center justify-center gap-2">
          <span className="size-2.5 rounded-full bg-lime-400 shadow-[0_0_8px_rgba(163,230,53,0.4)]" />
          <span className="font-heading text-lg font-bold">FitAI</span>
        </div>
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          Setup Profil Kamu
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Onboarding cepat biar AI coach makin personal
        </p>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-950/80">
        {/* Stepper bar */}
        <StepperBar currentIndex={currentIndex} />

        {/* Divider */}
        <div className="border-t border-zinc-800" />

        {/* Step content */}
        <div className="px-6 py-6 sm:px-10">
          {stepper.flow.when('welcome', () => (
            <StepWelcome data={formData} update={update} />
          ))}
          {stepper.flow.when('baseline', () => (
            <StepBaseline data={formData} update={update} />
          ))}
          {stepper.flow.when('goal', () => (
            <StepGoal data={formData} update={update} />
          ))}
          {stepper.flow.when('history', () => (
            <StepHistory data={formData} update={update} />
          ))}
          {stepper.flow.when('ready', () => (
            <StepReady data={formData} />
          ))}
        </div>

        {/* Footer with nav buttons */}
        <div className="flex items-center justify-between border-t border-zinc-800 px-6 py-4 sm:px-10">
          <div>
            {!isFirstStep && (
              <Button
                variant="ghost"
                onClick={() => stepper.navigation.prev()}
                className="text-sm text-zinc-400 hover:text-zinc-200"
              >
                Kembali
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!isLastStep && (
              <button
                onClick={handleSkip}
                disabled={saving}
                className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
              >
                Lewati
              </button>
            )}

            {isLastStep ? (
              <Button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-lime-400 px-6 text-sm font-semibold text-black hover:bg-lime-300 disabled:opacity-40"
              >
                {saving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  'Buka Dashboard'
                )}
              </Button>
            ) : (
              <Button
                onClick={() => stepper.navigation.next()}
                disabled={isNextDisabled}
                className="rounded-lg bg-lime-400 px-6 text-sm font-semibold text-black hover:bg-lime-300 disabled:opacity-40"
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
