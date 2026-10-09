'use client';

import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Newspaper } from 'lucide-react';
import { getCrawledNews, type NewsItem } from '@/lib/pika';
import { Panel } from '@/components/layout';
import { Chip } from '@/components/ui/chip';
import { ChipGroup } from '@/components/ui/chip-group';
import { SearchDialog } from '@/components/ui/search-dialog';

interface SearchFilterProps {
  tags: string[];
}

/** Explore filter bar: search the crawled news and filter the grid by tag (both live in the URL). */
export function SearchFilter({ tags }: SearchFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { locale } = useParams<{ locale: string }>();
  const activeTag = searchParams.get('tag');

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <Panel className="mb-8">
      <div className="flex flex-col gap-5">
        <SearchDialog<NewsItem>
          placeholder="Search tech news..."
          search={async (q) => (await getCrawledNews(1, 6, q)).items}
          getKey={(item) => item._id ?? item.link}
          onSelect={(item) => item._id && router.push(`/${locale}/blog/explore/${item._id}`)}
          renderItem={(item) => (
            <>
              <Newspaper className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-medium">{item.title}</span>
                <span className="text-xs text-muted-foreground">
                  {item.source}
                  {item.pubDate && ` · ${new Date(item.pubDate).getFullYear()}`}
                </span>
              </span>
            </>
          )}
          searchAll={{
            label: (q) => <>Search all results for &quot;{q}&quot;</>,
            onRun: (q) => setParam('q', q),
          }}
        />
        {tags.length > 0 && (
          <ChipGroup label="Filter by tag">
            <Chip active={!activeTag} onClick={() => setParam('tag', null)}>
              All
            </Chip>
            {tags.map((tag) => (
              <Chip key={tag} active={activeTag === tag} onClick={() => setParam('tag', activeTag === tag ? null : tag)}>
                {tag}
              </Chip>
            ))}
          </ChipGroup>
        )}
      </div>
    </Panel>
  );
}
