'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';

interface HeaderProps {
  locale: string;
}

export function Header({ locale }: HeaderProps) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname.includes(path);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Brand */}
          <div className="flex items-center gap-8">
            <Link 
              href={`/${locale}`}
              className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              SP
            </Link>
            
            {/* Navigation */}
            <nav className="hidden sm:flex items-center gap-6">
              <Link 
                href={`/${locale}/blog`}
                className={`text-sm font-medium transition-colors ${
                  isActive('/blog') 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Blog
              </Link>
              <Link 
                href={`/${locale}/playground`}
                className={`text-sm font-medium transition-colors ${
                  isActive('/playground') 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Playground
              </Link>
            </nav>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            <LanguageSwitcher locale={locale} />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
