'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  locale: string;
}

const locales = [
  { code: 'en', label: 'EN' },
  { code: 'vi', label: 'VI' },
];

export function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (newLocale: string) => {
    // Replace the locale in the pathname
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');
    router.push(newPath);
  };

  return (
    <div className="flex items-center gap-1">
      <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
        {locales.map((loc) => (
          <button
            key={loc.code}
            onClick={() => switchLocale(loc.code)}
            className={`px-2 py-1 text-sm font-medium rounded-md transition-colors ${
              locale === loc.code
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {loc.label}
          </button>
        ))}
      </div>
    </div>
  );
}
