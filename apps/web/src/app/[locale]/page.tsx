import { getTranslations, setRequestLocale } from 'next-intl/server';
import { BookOpen, Network, Terminal } from 'lucide-react';
import { HeroSection } from '@/components/home/hero-section';
import { PillarCard } from '@/components/home/pillar-card';

export default async function LocaleHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');

  const taglines = [0, 1, 2, 3, 4].map((i) => t(`taglines.${i}`));

  return (
    <div>
      <HeroSection
        locale={locale}
        greeting={t('greeting')}
        name={t('name')}
        role={t('role')}
        taglines={taglines}
        viewBlog={t('viewBlog')}
        viewGraph={t('viewGraph')}
      />

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-16 sm:px-6 md:grid-cols-3">
        <PillarCard
          index="01"
          href={`/${locale}/blog`}
          icon={BookOpen}
          title={t('blogSection.title')}
          description={t('blogSection.description')}
          cta={t('blogSection.cta')}
        />
        <PillarCard
          index="02"
          href={`/${locale}/knowledge-graph`}
          icon={Network}
          title={t('graphSection.title')}
          description={t('graphSection.description')}
          cta={t('graphSection.cta')}
        />
        <PillarCard
          index="03"
          href={`/${locale}/playground`}
          icon={Terminal}
          title={t('playgroundSection.title')}
          description={t('playgroundSection.description')}
          cta={t('playgroundSection.cta')}
          theme="terminal"
        />
      </section>
    </div>
  );
}
