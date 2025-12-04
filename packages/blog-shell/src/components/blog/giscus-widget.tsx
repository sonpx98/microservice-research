'use client';

import Giscus from '@giscus/react';

interface GiscusWidgetProps {
  locale: string;
}

export function GiscusWidget({ locale }: GiscusWidgetProps) {
  const repo = process.env.NEXT_PUBLIC_GISCUS_REPO as `${string}/${string}`;
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID!;
  const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY!;
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID!;

  // Don't render if env vars are missing
  if (!repo || !repoId || !categoryId) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-yellow-800 dark:text-yellow-200">
          Giscus configuration missing. Please set NEXT_PUBLIC_GISCUS_* environment variables.
        </p>
      </div>
    );
  }

  return (
    <Giscus
      repo={repo}
      repoId={repoId}
      category={category}
      categoryId={categoryId}
      mapping="pathname"
      strict="0"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme="preferred_color_scheme"
      lang={locale}
      loading="lazy"
    />
  );
}
