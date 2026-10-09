import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, Code, Lock, Terminal, type LucideIcon } from 'lucide-react';
import { PageShell } from '@/components/layout';

interface Lab {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium';
  icon: LucideIcon;
}

const LABS: Lab[] = [
  { id: 'xss', title: 'XSS Attack', description: 'Inject malicious scripts into a vulnerable comment section.', difficulty: 'Easy', icon: Code },
  { id: 'sql-injection', title: 'SQL Injection', description: 'Bypass authentication using SQL injection techniques.', difficulty: 'Easy', icon: Terminal },
  { id: 'csrf', title: 'CSRF Attack', description: 'Forge requests to perform unauthorized actions.', difficulty: 'Medium', icon: AlertTriangle },
  { id: 'jwt-tampering', title: 'JWT Tampering', description: 'Decode and modify JWT tokens to escalate privileges.', difficulty: 'Medium', icon: Lock },
];

const DIFFICULTY_TONE: Record<Lab['difficulty'], string> = {
  Easy: 'border-success/30 text-success',
  Medium: 'border-warning/30 text-warning',
};

const LEARNINGS = [
  "Understand common web vulnerabilities from an attacker's perspective",
  'Identify and exploit security flaws in a safe environment',
  'Apply the fixes to your own applications',
];

export default async function PlaygroundPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('playground');

  return (
    <PageShell
      eyebrow={`${t('security.title')} · ${LABS.length} ${t('security.challenges')}`}
      title={t('title')}
      description={t('security.description')}
    >
      <div className="grid gap-4 md:grid-cols-2">
        {LABS.map(({ id, title, description, difficulty, icon: Icon }, i) => (
          <Link
            key={id}
            href={`/${locale}/playground/${id}`}
            className="group flex gap-4 rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
                <h2 className="font-semibold text-card-foreground">{title}</h2>
                <span className={`rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase ${DIFFICULTY_TONE[difficulty]}`}>
                  {difficulty}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-lg border border-border bg-card p-6">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">What you will learn</p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          {LEARNINGS.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="font-mono text-primary">&gt;</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </PageShell>
  );
}
