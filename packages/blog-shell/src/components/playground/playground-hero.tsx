'use client';

import { Terminal } from 'lucide-react';
import { TypewriterLoop } from '@/components/ui/typewriter';

interface PlaygroundHeroProps {
  badge: string;
  title: string;
  taglines: string[];
}

export function PlaygroundHero({
  badge,
  title,
  taglines,
}: PlaygroundHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl" />
      
      <div className="relative container mx-auto px-4 py-20 max-w-6xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-sm font-medium mb-6">
            <Terminal className="w-4 h-4" />
            {badge}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {title}
          </h1>
          <div className="text-xl text-gray-300 h-14 md:h-8 flex items-start">
            <TypewriterLoop 
              texts={taglines}
              speed={25}
              deleteSpeed={15}
              pauseDuration={2000}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
