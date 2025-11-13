import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';

export default async function LocaleHomePage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  
  const t = await getTranslations('blog');

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-6">
          {t('title')}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          {t('description')}
        </p>
        <Link 
          href={`/${locale}/blog`}
          className="inline-flex items-center px-6 py-3 bg-gray-900 dark:bg-gray-50 text-white dark:text-gray-900 rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          View Blog
        </Link>
      </div>
    </div>
  );
}
