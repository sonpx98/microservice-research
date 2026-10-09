'use client';

import { usePathname } from 'next/navigation';
import { ViewSwitch } from '@/components/layout';

const LOCALES = [
  { code: 'en', label: 'EN' },
  { code: 'vi', label: 'VI' },
];

export function LanguageSwitcher({ locale }: { locale: string }) {
  const pathname = usePathname();
  // Same page, other locale: swap the first path segment.
  const hrefFor = (code: string) => {
    const segments = pathname.split('/');
    segments[1] = code;
    return segments.join('/');
  };

  return (
    <ViewSwitch
      items={LOCALES.map(({ code, label }) => ({ href: hrefFor(code), label, active: code === locale }))}
    />
  );
}
