import Link from 'next/link';
import { ArrowRight, type LucideIcon } from 'lucide-react';

interface PillarCardProps {
  index: string;
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  cta: string;
  /** Opt the card into another theme preset, e.g. "terminal" to preview the playground. */
  theme?: string;
}

export function PillarCard({ index, href, icon: Icon, title, description, cta, theme }: PillarCardProps) {
  return (
    <Link
      href={href}
      data-theme={theme}
      className="group flex flex-col rounded-lg border border-border bg-card p-6 text-card-foreground transition-colors hover:border-primary"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-muted-foreground">{index}</span>
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h2 className="mt-8 text-xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 flex-1 text-sm text-muted-foreground">{description}</p>
      <span className="mt-6 inline-flex items-center gap-2 font-mono text-xs text-primary transition-all group-hover:gap-3">
        {cta}
        <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}
