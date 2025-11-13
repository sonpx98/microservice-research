'use client';

import Giscus from '@giscus/react';
import { useTranslations } from 'next-intl';

interface CommentSectionProps {
  locale: string;
}

export function CommentSection({ locale }: CommentSectionProps) {
  const t = useTranslations('common');

  return (
    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
      <h2 className="text-2xl font-bold mb-6">{t('comments')}</h2>
      <Giscus
        repo="sonpx98/microservice-research"
        repoId="R_YOUR_REPO_ID"
        category="Blog Comments"
        categoryId="DIC_YOUR_CATEGORY_ID"
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme="preferred_color_scheme"
        lang={locale}
        loading="lazy"
      />
    </div>
  );
}
