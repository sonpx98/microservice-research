'use client';

import { BookOpen, Rocket, Tag, GraduationCap, BrainCircuit } from 'lucide-react';
import { TypewriterLoop } from '@/components/ui/typewriter';

interface EnglishHeroProps {
  title: string;
  taglines: string[];
}

export function EnglishHero({
  title,
  taglines,
}: EnglishHeroProps) {
  
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl" />
      
      <div className="relative container mx-auto px-4 py-16 md:py-24 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium w-fit">
            <GraduationCap className="w-4 h-4" />
            English Learning
          </div>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium w-fit">
            <BrainCircuit className="w-4 h-4 text-pink-300" />
            <span className="text-white/90">Powered by AI</span>
            </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {title}
        </h1>
        
        <div className="text-lg md:text-xl text-white/80 max-w-2xl h-14 md:h-8 flex items-start">
            <TypewriterLoop 
              texts={taglines}
              speed={25}
              deleteSpeed={15}
              pauseDuration={2000}
            />
        </div>
        
        {/* Stats Placeholder - Could be real stats later */}
        <div className="flex gap-8 mt-8">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-300" />
            <span className="text-white/90">AI Generated Readings</span>
          </div>
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-300" />
            <span className="text-white/90">A1 - C2 Levels</span>
          </div>
        </div>
      </div>
    </section>
  );
}
