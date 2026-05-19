import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { checkOnboarding } from '@/lib/actions/onboarding';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  const onboarded = await checkOnboarding();
  if (!onboarded) redirect('/onboarding');

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
