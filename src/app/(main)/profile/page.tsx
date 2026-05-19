'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getProfile, updateProfile } from '@/lib/actions/onboarding';

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

interface FormState {
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
  email: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getProfile().then((data) => {
      if (data) {
        setForm({
          email: data.email ?? '',
          display_name: data.displayName ?? '',
          gender: data.gender ?? '',
          age: data.age?.toString() ?? '',
          height_cm: data.heightCm ?? '',
          weight_kg: data.weightKg ?? '',
          goal: data.goal ?? '',
          activity_level: data.activityLevel ?? '',
          exercise_history: data.exerciseHistory ?? '',
          injuries: data.injuries ?? '',
          address: data.address ?? '',
        });
      }
      setLoading(false);
    });
  }, []);

  function update(field: keyof FormState, value: string) {
    if (!form) return;
    setSaved(false);
    setForm({ ...form, [field]: value });
  }

  async function handleSave() {
    if (!form) return;
    setSaving(true);
    try {
      await updateProfile({
        display_name: form.display_name || null,
        gender: form.gender || null,
        age: form.age ? Number(form.age) : null,
        height_cm: form.height_cm ? Number(form.height_cm) : null,
        weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
        goal: form.goal || 'maintenance',
        activity_level: form.activity_level || 'moderate',
        exercise_history: form.exercise_history || null,
        injuries: form.injuries || null,
        address: form.address || null,
      });
      setSaved(true);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!form) return null;

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Profil</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Data personalisasi kamu. Edit kapan saja.
          </p>
        </div>

        {/* Email (read-only) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Akun</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={form.email} disabled className="opacity-60" />
            </div>
            <div className="space-y-1.5">
              <Label>Nama Tampilan</Label>
              <Input
                value={form.display_name}
                onChange={(e) => update('display_name', e.target.value)}
                placeholder="Mau dipanggil apa?"
              />
            </div>
          </CardContent>
        </Card>

        {/* Body */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Data Tubuh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Gender */}
            <div className="space-y-1.5">
              <Label>Jenis Kelamin</Label>
              <div className="flex gap-2">
                {GENDER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => update('gender', opt.value)}
                    className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                      form.gender === opt.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Row: Umur, TB, BB */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Umur</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={form.age}
                    onChange={(e) => update('age', e.target.value)}
                    placeholder="—"
                    className="pr-12"
                  />
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    tahun
                  </span>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Tinggi</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={form.height_cm}
                    onChange={(e) => update('height_cm', e.target.value)}
                    placeholder="—"
                    className="pr-8"
                  />
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    cm
                  </span>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Berat</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={form.weight_kg}
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
          </CardContent>
        </Card>

        {/* Fitness */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fitness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Goal</Label>
                <select
                  value={form.goal}
                  onChange={(e) => update('goal', e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="">Pilih goal</option>
                  {GOAL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Level Aktivitas</Label>
                <select
                  value={form.activity_level}
                  onChange={(e) => update('activity_level', e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="">Pilih level</option>
                  {ACTIVITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Riwayat Olahraga</Label>
              <textarea
                value={form.exercise_history}
                onChange={(e) => update('exercise_history', e.target.value)}
                placeholder="Contoh: Gym 2 tahun, sekarang vakum..."
                rows={3}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Cedera / Limitasi</Label>
              <textarea
                value={form.injuries}
                onChange={(e) => update('injuries', e.target.value)}
                placeholder="Tulis jika ada"
                rows={2}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Alamat</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
              placeholder="Kota / daerah tempat tinggal"
              rows={2}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground resize-none"
            />
          </CardContent>
        </Card>

        {/* Save */}
        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-1.5 h-4 w-4" />
            )}
            Simpan
          </Button>
          {saved && (
            <span className="text-sm text-green-500">Tersimpan!</span>
          )}
        </div>
      </div>
    </div>
  );
}
