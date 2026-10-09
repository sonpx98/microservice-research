import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Full class strings so Tailwind can see them.
const TONES = {
  primary: { box: 'border-primary/30 bg-primary/10', accent: 'text-primary' },
  info: { box: 'border-info/30 bg-info/10', accent: 'text-info' },
  success: { box: 'border-success/30 bg-success/10', accent: 'text-success' },
  warning: { box: 'border-warning/30 bg-warning/10', accent: 'text-warning' },
  danger: { box: 'border-danger/30 bg-danger/10', accent: 'text-danger' },
} as const;

export interface CalloutProps {
  tone?: keyof typeof TONES;
  icon?: LucideIcon;
  title?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

/** Tinted note: tips, hints, warnings, results. Title and icon take the tone; body stays readable foreground. */
export function Callout({ tone = 'info', icon: Icon, title, className, children }: CalloutProps) {
  const t = TONES[tone];
  return (
    <div className={cn('flex gap-3 rounded-lg border p-4', t.box, className)}>
      {Icon && <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', t.accent)} />}
      <div className="flex min-w-0 flex-1 flex-col gap-1 text-sm text-foreground">
        {title && <p className={cn('font-semibold', t.accent)}>{title}</p>}
        {children}
      </div>
    </div>
  );
}
