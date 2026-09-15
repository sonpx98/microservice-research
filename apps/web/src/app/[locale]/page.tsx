import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { ArrowRight, BookOpen, Shield, Terminal, Unlock } from 'lucide-react';
import { getAllPosts } from '@/lib/posts';
import { HeroSection } from '@/components/home/hero-section';

export default async function LocaleHomePage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  
  const t = await getTranslations('home');
  const posts = getAllPosts(locale);
  const recentPosts = posts.slice(0, 3);
  
  // Get taglines array from translations
  const taglines = [
    t('taglines.0'),
    t('taglines.1'),
    t('taglines.2'),
    t('taglines.3'),
    t('taglines.4'),
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Typewriter */}
      <HeroSection
        locale={locale}
        greeting={t('greeting')}
        name={t('name')}
        role={t('role')}
        taglines={taglines}
        viewBlog={t('viewBlog')}
        viewPlayground={t('viewPlayground')}
      />

      {/* Main Sections: Blog & Playground */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Blog Card */}
            <Link 
              href={`/${locale}/blog`}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-8 md:p-10 text-white hover:shadow-2xl transition-all"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-colors" />
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{t('blogSection.title')}</h3>
                <p className="text-gray-300 mb-6">
                  {t('blogSection.description')}
                </p>
                <div className="flex items-center gap-2 text-blue-400 font-medium group-hover:gap-3 transition-all">
                  {t('blogSection.cta')}
                  <ArrowRight className="w-4 h-4" />
                </div>
                
                {/* Recent posts preview */}
                {recentPosts.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-white/10">
                    <p className="text-sm text-gray-400 mb-3">Latest posts:</p>
                    <ul className="space-y-2">
                      {recentPosts.map((post) => (
                        <li key={post.slug} className="text-sm text-gray-300 truncate">
                          • {post.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Link>

            {/* Playground Card */}
            <Link 
              href={`/${locale}/playground`}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900 to-indigo-900 p-8 md:p-10 text-white hover:shadow-2xl transition-all"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/30 transition-colors" />
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Terminal className="w-7 h-7" />
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-2xl font-bold">{t('playgroundSection.title')}</h3>
                  <span className="px-2 py-1 text-xs font-medium bg-yellow-500/20 text-yellow-300 rounded-full">
                    {t('playgroundSection.comingSoon')}
                  </span>
                </div>
                <p className="text-gray-300 mb-6">
                  {t('playgroundSection.description')}
                </p>
                <div className="flex items-center gap-2 text-purple-400 font-medium group-hover:gap-3 transition-all">
                  {t('playgroundSection.cta')}
                  <ArrowRight className="w-4 h-4" />
                </div>
                
                {/* Security Lab Preview */}
                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <p className="font-medium">Security Lab</p>
                      <p className="text-sm text-gray-400 flex items-center gap-1"><Unlock className="w-4 h-4" /> Think like a hacker</p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to explore?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Dive into articles about modern web development or test your security skills in the playground.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href={`/${locale}/blog`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-all"
            >
              Browse Blog
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
