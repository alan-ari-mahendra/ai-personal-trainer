'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export interface OnboardingFormData {
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

interface OnboardingFormProps {
  formData: OnboardingFormData;
  setFormData: (data: OnboardingFormData) => void;
  aiFilledFields: Set<string>;
  onSave: () => void;
  saving: boolean;
}

const GENDER_OPTIONS = [
  { label: 'Pria', value: 'male' },
  { label: 'Wanita', value: 'female' },
  { label: 'Lainnya', value: 'other' },
] as const;

const GOAL_OPTIONS = [
  { label: 'Cutting', value: 'cutting' },
  { label: 'Bulking', value: 'bulking' },
  { label: 'Maintenance', value: 'maintenance' },
  { label: 'Health', value: 'health' },
] as const;

const ACTIVITY_OPTIONS = [
  { label: 'Sedentary', value: 'sedentary' },
  { label: 'Light', value: 'light' },
  { label: 'Moderate', value: 'moderate' },
  { label: 'Active', value: 'active' },
  { label: 'Very Active', value: 'very_active' },
] as const;

function AiBadge() {
  return (
    <span className="ml-1.5 inline-flex items-center rounded-full bg-lime-400/20 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-lime-400 border border-lime-400/30">
      AI Filled
    </span>
  );
}

export function OnboardingForm({
  formData,
  setFormData,
  aiFilledFields,
  onSave,
  saving,
}: OnboardingFormProps) {
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const prevDataRef = useRef<OnboardingFormData>(formData);

  const setFieldRef = useCallback(
    (field: string) => (el: HTMLDivElement | null) => {
      fieldRefs.current[field] = el;
    },
    [],
  );

  // Flash animation when AI fills a field
  useEffect(() => {
    const prev = prevDataRef.current;
    const changedFields: string[] = [];

    for (const key of Object.keys(formData) as (keyof OnboardingFormData)[]) {
      if (formData[key] !== prev[key] && aiFilledFields.has(key)) {
        changedFields.push(key);
      }
    }

    for (const field of changedFields) {
      const el = fieldRefs.current[field];
      if (el) {
        el.setAttribute('data-flash', 'true');
        setTimeout(() => el.removeAttribute('data-flash'), 600);
      }
    }

    prevDataRef.current = { ...formData };
  }, [formData, aiFilledFields]);

  function update(field: keyof OnboardingFormData, value: string) {
    setFormData({ ...formData, [field]: value });
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="shrink-0 border-b border-border/50 px-6 py-5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Onboarding &middot; Biodata
        </p>
        <h2 className="mt-1 text-xl font-bold text-foreground">Profil Kamu</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Isi manual atau biarin AI yang ngisi otomatis lewat chat. Semua field
          opsional — bisa dilengkapin nanti.
        </p>
      </div>

      {/* Form body — scrollable */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {/* Nama Tampilan */}
        <div
          ref={setFieldRef('display_name')}
          className="field-container space-y-1.5"
        >
          <Label>
            Nama Tampilan
            {aiFilledFields.has('display_name') && <AiBadge />}
          </Label>
          <Input
            value={formData.display_name}
            onChange={(e) => update('display_name', e.target.value)}
            placeholder="Mau dipanggil apa?"
          />
        </div>

        {/* Jenis Kelamin */}
        <div
          ref={setFieldRef('gender')}
          className="field-container space-y-1.5"
        >
          <Label>
            Jenis Kelamin
            {aiFilledFields.has('gender') && <AiBadge />}
          </Label>
          <div className="flex gap-2">
            {GENDER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => update('gender', opt.value)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                  formData.gender === opt.value
                    ? 'border-lime-400 bg-lime-400/10 text-lime-400'
                    : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Row of 3: Umur, Tinggi, Berat */}
        <div className="grid grid-cols-3 gap-3">
          <div
            ref={setFieldRef('age')}
            className="field-container space-y-1.5"
          >
            <Label>
              Umur
              {aiFilledFields.has('age') && <AiBadge />}
            </Label>
            <div className="relative">
              <Input
                type="number"
                value={formData.age}
                onChange={(e) => update('age', e.target.value)}
                placeholder="—"
                className="pr-12"
              />
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                tahun
              </span>
            </div>
          </div>

          <div
            ref={setFieldRef('height_cm')}
            className="field-container space-y-1.5"
          >
            <Label>
              Tinggi
              {aiFilledFields.has('height_cm') && <AiBadge />}
            </Label>
            <div className="relative">
              <Input
                type="number"
                value={formData.height_cm}
                onChange={(e) => update('height_cm', e.target.value)}
                placeholder="—"
                className="pr-8"
              />
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                cm
              </span>
            </div>
          </div>

          <div
            ref={setFieldRef('weight_kg')}
            className="field-container space-y-1.5"
          >
            <Label>
              Berat
              {aiFilledFields.has('weight_kg') && <AiBadge />}
            </Label>
            <div className="relative">
              <Input
                type="number"
                value={formData.weight_kg}
                onChange={(e) => update('weight_kg', e.target.value)}
                placeholder="—"
                className="pr-8"
              />
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                kg
              </span>
            </div>
          </div>
        </div>

        {/* Row of 2: Goal, Level Aktivitas */}
        <div className="grid grid-cols-2 gap-3">
          <div
            ref={setFieldRef('goal')}
            className="field-container space-y-1.5"
          >
            <Label>
              Goal
              {aiFilledFields.has('goal') && <AiBadge />}
            </Label>
            <div className="relative">
              <select
                value={formData.goal}
                onChange={(e) => update('goal', e.target.value)}
                className="h-8 w-full appearance-none rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Pilih goal</option>
                {GOAL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                &#9662;
              </span>
            </div>
          </div>

          <div
            ref={setFieldRef('activity_level')}
            className="field-container space-y-1.5"
          >
            <Label>
              Level Aktivitas
              {aiFilledFields.has('activity_level') && <AiBadge />}
            </Label>
            <div className="relative">
              <select
                value={formData.activity_level}
                onChange={(e) => update('activity_level', e.target.value)}
                className="h-8 w-full appearance-none rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Pilih level</option>
                {ACTIVITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                &#9662;
              </span>
            </div>
          </div>
        </div>

        {/* Riwayat Olahraga */}
        <div
          ref={setFieldRef('exercise_history')}
          className="field-container space-y-1.5"
        >
          <Label>
            Riwayat Olahraga
            {aiFilledFields.has('exercise_history') && <AiBadge />}
          </Label>
          <textarea
            value={formData.exercise_history}
            onChange={(e) => update('exercise_history', e.target.value)}
            placeholder="Contoh: Gym 2 tahun, sekarang vakum..."
            rows={3}
            className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors resize-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <p className="text-xs text-muted-foreground">
            Bisa diisi nanti di Settings
          </p>
        </div>

        {/* Cedera / Limitasi */}
        <div
          ref={setFieldRef('injuries')}
          className="field-container space-y-1.5"
        >
          <Label>
            Cedera / Limitasi
            {aiFilledFields.has('injuries') && <AiBadge />}
          </Label>
          <textarea
            value={formData.injuries}
            onChange={(e) => update('injuries', e.target.value)}
            placeholder="Tulis jika ada, atau kosongkan"
            rows={3}
            className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors resize-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <p className="text-xs text-muted-foreground">
            Bisa diisi nanti di Settings
          </p>
        </div>

        {/* Alamat */}
        <div
          ref={setFieldRef('address')}
          className="field-container space-y-1.5"
        >
          <Label>
            Alamat
            {aiFilledFields.has('address') && <AiBadge />}
          </Label>
          <textarea
            value={formData.address}
            onChange={(e) => update('address', e.target.value)}
            placeholder="Kota / daerah tempat tinggal"
            rows={2}
            className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors resize-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
      </div>

      {/* Footer — sticky bottom */}
      <div className="shrink-0 border-t border-border/50 bg-gradient-to-t from-background via-background to-background/80 px-6 py-4">
        <Button
          onClick={onSave}
          disabled={saving}
          className="w-full h-10 rounded-lg bg-lime-400 text-black font-bold uppercase tracking-wide hover:bg-lime-500 transition-colors border-none"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>&#x1F680; Mulai Training</>
          )}
        </Button>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Atau lengkapin profil lewat chat di kanan &rarr;
        </p>
      </div>

      {/* Flash animation styles */}
      <style>{`
        .field-container[data-flash="true"] input,
        .field-container[data-flash="true"] textarea,
        .field-container[data-flash="true"] select {
          border-color: #a3e635;
          box-shadow: 0 0 0 3px rgba(163, 230, 53, 0.25);
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .field-container input,
        .field-container textarea,
        .field-container select {
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
      `}</style>
    </div>
  );
}
