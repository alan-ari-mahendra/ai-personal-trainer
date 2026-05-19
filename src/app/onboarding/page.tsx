'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  OnboardingForm,
  type OnboardingFormData,
} from '@/components/onboarding/onboarding-form';
import { OnboardingChat } from '@/components/onboarding/onboarding-chat';
import { saveOnboarding } from '@/lib/actions/onboarding';

const EMPTY_FORM: OnboardingFormData = {
  display_name: '',
  gender: '',
  age: '',
  height_cm: '',
  weight_kg: '',
  goal: '',
  activity_level: '',
  exercise_history: '',
  injuries: '',
};

export default function OnboardingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<OnboardingFormData>(EMPTY_FORM);
  const [aiFilledFields, setAiFilledFields] = useState<Set<string>>(
    new Set(),
  );
  const [saving, setSaving] = useState(false);

  // Called by OnboardingChat when AI fills form fields
  const onFormUpdate = useCallback(
    (updates: Record<string, unknown>) => {
      const newFields: string[] = [];

      setFormData((prev) => {
        const next = { ...prev };
        for (const [key, value] of Object.entries(updates)) {
          if (value != null && key in prev) {
            (next as Record<string, string>)[key] = String(value);
            newFields.push(key);
          }
        }
        return next;
      });

      if (newFields.length > 0) {
        setAiFilledFields((prev) => {
          const next = new Set(prev);
          for (const f of newFields) next.add(f);
          return next;
        });
      }
    },
    [],
  );

  // Save onboarding data
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
      });
      router.push('/chat');
    } catch (error) {
      console.error('Failed to save onboarding:', error);
    } finally {
      setSaving(false);
    }
  }, [formData, router]);

  // Skip onboarding — save minimal data
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
      });
      router.push('/chat');
    } catch (error) {
      console.error('Failed to skip onboarding:', error);
    } finally {
      setSaving(false);
    }
  }, [router]);

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Nav bar */}
      <header className="shrink-0 flex items-center justify-between border-b border-border/50 px-6 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-lime-400" />
          <span className="text-lg font-bold text-foreground">FitAI</span>
        </div>

        {/* Progress pill */}
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-border px-3 py-1.5">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-lime-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-lime-400" />
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            Step 01 / 01 &middot; Setup
          </span>
        </div>

        {/* Skip button */}
        <button
          onClick={handleSkip}
          disabled={saving}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Lewati &rarr;
        </button>
      </header>

      {/* Main content — split screen */}
      <main className="flex flex-1 min-h-0 flex-col lg:flex-row">
        {/* Form pane — 45% on desktop */}
        <div className="order-2 lg:order-1 lg:w-[45%] border-t lg:border-t-0 lg:border-r border-border/50 min-h-0 overflow-hidden">
          <OnboardingForm
            formData={formData}
            setFormData={setFormData}
            aiFilledFields={aiFilledFields}
            onSave={handleSave}
            saving={saving}
          />
        </div>

        {/* Chat pane — 55% on desktop */}
        <div className="order-1 lg:order-2 lg:w-[55%] min-h-0 overflow-hidden flex-1 lg:flex-none">
          <OnboardingChat onFormUpdate={onFormUpdate} />
        </div>
      </main>
    </div>
  );
}
