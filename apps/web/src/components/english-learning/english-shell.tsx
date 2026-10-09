import { PageShell, ViewSwitch } from '@/components/layout';

interface EnglishShellProps {
  locale: string;
  active: 'readings' | 'conversations';
  title: string;
  description: string;
  children: React.ReactNode;
}

/** Shared frame for the English learning pages: PageShell plus the Readings / Conversations switch. */
export function EnglishShell({ locale, active, title, description, children }: EnglishShellProps) {
  const base = `/${locale}/english-learning`;
  return (
    <PageShell
      eyebrow="English Learning"
      title={title}
      description={description}
      actions={
        <ViewSwitch
          items={[
            { href: base, label: 'Readings', active: active === 'readings' },
            { href: `${base}/conversation`, label: 'Conversations', active: active === 'conversations' },
          ]}
        />
      }
    >
      {children}
    </PageShell>
  );
}
