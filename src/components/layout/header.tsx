'use client';

import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

const pageTitles: Record<string, string> = {
  '/chat': 'Chat',
  '/dashboard': 'Dashboard',
  '/settings': 'Settings',
};

function getTitle(pathname: string): string {
  for (const [prefix, title] of Object.entries(pageTitles)) {
    if (pathname.startsWith(prefix)) return title;
  }
  return 'FitAI';
}

export function Header() {
  const pathname = usePathname();
  const title = getTitle(pathname);

  return (
    <header className="flex h-14 items-center gap-3 border-b border-border px-4">
      {/* Mobile menu button — placeholder for future mobile sidebar toggle */}
      <Button variant="ghost" size="icon" className="md:hidden">
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      <h1 className="text-base font-semibold">{title}</h1>
    </header>
  );
}
