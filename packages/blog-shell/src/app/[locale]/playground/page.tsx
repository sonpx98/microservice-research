import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { Shield, ArrowRight, Lock, Code, AlertTriangle, Terminal } from 'lucide-react';
import { PlaygroundHero } from '@/components/playground/playground-hero';

export default async function PlaygroundPage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  
  const t = await getTranslations('playground');

  const taglines = [
    t('taglines.0'),
    t('taglines.1'),
    t('taglines.2'),
    t('taglines.3'),
  ];

  const securityChallenges = [
    {
      id: 'xss',
      title: 'XSS Attack',
      description: 'Inject malicious scripts into a vulnerable comment section',
      difficulty: 'Easy',
      difficultyColor: 'bg-green-500',
      icon: Code,
      status: 'active',
    },
    {
      id: 'sql-injection',
      title: 'SQL Injection',
      description: 'Bypass authentication using SQL injection techniques',
      difficulty: 'Easy',
      difficultyColor: 'bg-green-500',
      icon: Terminal,
      status: 'active',
    },
    {
      id: 'csrf',
      title: 'CSRF Attack',
      description: 'Forge requests to perform unauthorized actions',
      difficulty: 'Medium',
      difficultyColor: 'bg-yellow-500',
      icon: AlertTriangle,
      status: 'active',
    },
    {
      id: 'jwt-tampering',
      title: 'JWT Tampering',
      description: 'Decode and modify JWT tokens to escalate privileges',
      difficulty: 'Medium',
      difficultyColor: 'bg-yellow-500',
      icon: Lock,
      status: 'active',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <PlaygroundHero
        badge={t('badge')}
        title={t('title')}
        taglines={taglines}
      />

      {/* Security Lab Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Section Header */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">{t('security.title')}</h2>
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full">
                  {t('security.comingSoon')}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">{t('security.description')}</p>
            </div>
          </div>

          {/* Challenges Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {securityChallenges.map((challenge) => {
              const Icon = challenge.icon;
              const isActive = challenge.status === 'active';
              
              const CardContent = (
                <>
                  {/* Coming Soon Overlay - only for inactive */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-gray-900/5 dark:bg-gray-900/20 flex items-center justify-center z-10">
                      <span className="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm font-medium rounded-full">
                        Coming Soon
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isActive 
                        ? 'bg-gradient-to-br from-red-500 to-orange-500' 
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {challenge.title}
                        </h3>
                        <span className={`px-2 py-0.5 text-xs font-medium text-white rounded ${challenge.difficultyColor}`}>
                          {challenge.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {challenge.description}
                      </p>
                    </div>
                    {isActive && (
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
                    )}
                  </div>
                </>
              );

              if (isActive) {
                return (
                  <Link
                    key={challenge.id}
                    href={`/${locale}/playground/${challenge.id}`}
                    className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-red-300 dark:hover:border-red-700 transition-all"
                  >
                    {CardContent}
                  </Link>
                );
              }

              return (
                <div
                  key={challenge.id}
                  className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 opacity-75 cursor-not-allowed"
                >
                  {CardContent}
                </div>
              );
            })}
          </div>

          {/* Info Card */}
          <div className="mt-12 p-6 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              🎯 What you&apos;ll learn
            </h3>
            <ul className="space-y-2 text-blue-800 dark:text-blue-200">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Understand common web vulnerabilities from an attacker&apos;s perspective
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Learn how to identify and exploit security flaws in a safe environment
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Discover best practices to protect your own applications
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-2xl font-bold mb-4">
            Want to be notified when challenges launch?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Follow the blog for updates on new playground features and security content.
          </p>
          <Link 
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all"
          >
            Read the Blog
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
