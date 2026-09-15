'use client';

import { Sparkle, Heart, Briefcase, Coins, Zap, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ReadingIconType = 'general' | 'love' | 'career' | 'money' | 'challenges' | 'opportunities';

interface ReadingTypeIconProps {
  type: ReadingIconType;
  className?: string;
}

const iconMap = {
  general: Sparkle,
  love: Heart,
  career: Briefcase,
  money: Coins,
  challenges: Zap,
  opportunities: Star,
};

export function ReadingTypeIcon({ type, className }: ReadingTypeIconProps) {
  const Icon = iconMap[type];
  return <Icon className={cn("w-8 h-8", className)} />;
}
