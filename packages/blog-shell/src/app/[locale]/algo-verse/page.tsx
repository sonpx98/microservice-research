import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { MemoryVisualizer } from '@/components/algo-verse/memory-visualizer';
import { Cpu } from 'lucide-react';
import { featureFlags } from '@/lib/feature-flags';

export default async function AlgoVersePage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Redirect to home if feature is disabled
  if (!featureFlags.ALGO_VERSE_ENABLED) {
    redirect(`/${locale}`);
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Page Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-6">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-bold">Algo Verse</h1>
          </div>
          <p className="text-blue-100 max-w-3xl">
            Visualize how code executes at a low level. Explore memory management, 
            call stack operations, and heap allocation in real-time.
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="flex-shrink-0 bg-blue-50 dark:bg-blue-950/20 border-b border-blue-200 dark:border-blue-800 px-4 py-2">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">
              i
            </div>
            <div className="flex-1">
              <p className="text-xs text-blue-900 dark:text-blue-100">
                <span className="font-semibold">Phase 1: Memory & Stack Visualization</span> — 
                Select an example from the dropdown or write your own simple JavaScript code.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Visualizer - Takes remaining space */}
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-4 overflow-hidden">
        <div className="container mx-auto max-w-7xl h-full">
          <MemoryVisualizer />
        </div>
      </div>
    </div>
  );
}
