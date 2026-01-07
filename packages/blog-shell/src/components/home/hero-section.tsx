'use client';

import Link from 'next/link';
import { BookOpen, Terminal, Sparkles } from 'lucide-react';
import { TypewriterLoop } from '@/components/ui/typewriter';

interface HeroSectionProps {
  locale: string;
  greeting: string;
  name: string;
  role: string;
  taglines: string[];
  viewBlog: string;
  viewPlayground: string;
}

export function HeroSection({
  locale,
  greeting,
  name,
  role,
  taglines,
  viewBlog,
  viewPlayground,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-purple-50 dark:from-blue-950/20 dark:via-transparent dark:to-purple-950/20" />
      
      {/* Animated grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      <div className="relative container mx-auto px-4 py-24 md:py-32 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto">
          {/* Greeting */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            {greeting} {name}
          </div>
          
          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-900 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
            {role}
          </h1>
          
          {/* Tagline with Typewriter effect */}
          <div className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto h-16 md:h-12 flex items-center justify-center">
            <TypewriterLoop 
              texts={taglines}
              speed={30}
              deleteSpeed={15}
              pauseDuration={2000}
            />
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href={`/${locale}/blog`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
            >
              <BookOpen className="w-5 h-5" />
              {viewBlog}
            </Link>
            <Link 
              href={`/${locale}/playground`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Terminal className="w-5 h-5" />
              {viewPlayground}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
