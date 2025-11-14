import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Personal Blog',
  description: 'A modern blog built with Next.js 15 and MDX',
};

const locales = ['en', 'vi'];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        {/* Dev-only: Banner to remind editing posts at keystatic-admin */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-blue-600 text-white py-2 px-4 text-center text-sm">
            📝 <strong>Edit posts at:</strong>{' '}
            <a 
              href="http://localhost:5007/keystatic" 
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold hover:text-blue-200"
            >
              http://localhost:5007/keystatic
            </a>
            {' '}(Keystatic Admin)
          </div>
        )}
        
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
