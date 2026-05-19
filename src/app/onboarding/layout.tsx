import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { checkOnboarding } from '@/lib/actions/onboarding';

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  // Already completed onboarding? Skip to chat
  const onboarded = await checkOnboarding();
  if (onboarded) redirect('/chat');

  return <>{children}</>;
}
