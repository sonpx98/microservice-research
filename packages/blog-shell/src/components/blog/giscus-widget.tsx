'use client';

import Giscus from '@giscus/react';

interface GiscusWidgetProps {
  locale: string;
}

export function GiscusWidget({ locale }: GiscusWidgetProps) {
  return (
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
  );
}
