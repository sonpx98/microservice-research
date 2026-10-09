'use client';

import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FileText } from 'lucide-react';
import { Panel } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { ChipGroup } from '@/components/ui/chip-group';
import { SearchDialog } from '@/components/ui/search-dialog';

interface ReadingHit {
  _id: string;
  title: string;
  level: string;
  topic: string;
}

interface ReadingSearchFilterProps {
  topics: string[];
  levels: string[];
}

const GATEWAY = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:3000/api';

async function searchReadings(q: string): Promise<ReadingHit[]> {
  const res = await fetch(`${GATEWAY}/readings?q=${encodeURIComponent(q)}`);
  return res.ok ? ((await res.json()).data ?? []) : [];
}

/** Readings filter bar: search, topic and level, all kept in the URL. */
export function ReadingSearchFilter({ topics, levels }: ReadingSearchFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { locale } = useParams<{ locale: string }>();
  const activeTopic = searchParams.get('topic');
  const activeLevel = searchParams.get('level');
  const hasFilters = Boolean(activeTopic || activeLevel || searchParams.get('q'));

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <Panel className="mb-8">
      <div className="flex flex-col gap-5">
        <SearchDialog<ReadingHit>
          placeholder="Search readings..."
          search={searchReadings}
          getKey={(r) => r._id}
          onSelect={(r) => router.push(`/${locale}/english-learning/${r._id}`)}
          renderItem={(r) => (
            <>
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-medium">{r.title}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {r.level} · {r.topic}
                </span>
              </span>
            </>
          )}
          searchAll={{
            label: (q) => <>Search all readings for &quot;{q}&quot;</>,
            onRun: (q) => setParam('q', q),
          }}
        />

        <div className="grid gap-5 md:grid-cols-[1fr_auto]">
          <ChipGroup label="Topic">
            <Chip active={!activeTopic} onClick={() => setParam('topic', null)}>
              All topics
            </Chip>
            {topics.map((topic) => (
              <Chip key={topic} active={activeTopic === topic} onClick={() => setParam('topic', activeTopic === topic ? null : topic)}>
                {topic}
              </Chip>
            ))}
          </ChipGroup>
          <ChipGroup label="Level">
            {levels.map((level) => (
              <Chip key={level} active={activeLevel === level} onClick={() => setParam('level', activeLevel === level ? null : level)}>
                {level}
              </Chip>
            ))}
          </ChipGroup>
        </div>

        {hasFilters && (
          <div className="flex justify-end border-t border-border pt-4">
            <Button variant="ghost" size="sm" onClick={() => router.push(pathname)}>
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </Panel>
  );
}
