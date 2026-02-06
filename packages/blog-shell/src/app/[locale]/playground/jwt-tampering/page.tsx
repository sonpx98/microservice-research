'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LevelSelector,
  TokenForger,
  LivePreview,
  SuccessModal,
  AttemptsHistory,
  jwtLevelExplanations,
  jwtSolutions,
  levels
} from './components';
import { generateJWTPreview, validateJWTToken } from './utils/jwt-validators';

export default function JWTTamperingPage() {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [header, setHeader] = useState('{\n  "alg": "HS256",\n  "typ": "JWT"\n}');
  const [payload, setPayload] = useState('{\n  "user": "guest",\n  "role": "user"\n}');
  const [signature, setSignature] = useState('original_signature_here');
  const [attempts, setAttempts] = useState<Array<{id: number; token: string; result: {success: boolean; message: string}}>>([]);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [showSignature, setShowSignature] = useState(false);

  // Load saved progress from localStorage
  useEffect(() => {
    const savedLevel = localStorage.getItem('jwt-challenge-level');
    const savedCompleted = localStorage.getItem('jwt-challenge-completed');
    
    if (savedLevel) setCurrentLevel(parseInt(savedLevel, 10));
    if (savedCompleted) {
      try { setCompletedLevels(JSON.parse(savedCompleted)); } catch { /* ignore */ }
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) localStorage.setItem('jwt-challenge-level', String(currentLevel));
  }, [currentLevel, isHydrated]);

  useEffect(() => {
    if (isHydrated) localStorage.setItem('jwt-challenge-completed', JSON.stringify(completedLevels));
  }, [completedLevels, isHydrated]);

  const level = levels.find(l => l.id === currentLevel)!;

  const handleForgeToken = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    const result = validateJWTToken(header, payload, signature, currentLevel);
    const token = generateJWTPreview(header, payload, signature);
    
    setAttempts(prev => [...prev, { id: Date.now(), token, result }]);

    if (result.success) {
      setShowSuccess(true);
      if (!completedLevels.includes(currentLevel)) {
        setCompletedLevels(prev => [...prev, currentLevel]);
      }
    }
  }, [header, payload, signature, currentLevel, completedLevels]);

  const resetLevel = () => {
    setAttempts([]);
    setShowSuccess(false);
    setShowHint(false);
    setShowSolution(false);
    setHeader('{\n  "alg": "HS256",\n  "typ": "JWT"\n}');
    setPayload('{\n  "user": "guest",\n  "role": "user"\n}');
    setSignature('original_signature_here');
  };

  const nextLevel = () => {
    if (currentLevel < levels.length) {
      setCurrentLevel(prev => prev + 1);
      resetLevel();
    }
  };

  const goToLevel = (levelId: number) => {
    setCurrentLevel(levelId);
    resetLevel();
  };

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const loadSolution = () => {
    try {
      const solution = JSON.parse(jwtSolutions[currentLevel]);
      setHeader(JSON.stringify(solution.header, null, 2));
      setPayload(JSON.stringify(solution.payload, null, 2));
      setSignature(solution.signature || '');
      setShowSolution(false);
    } catch {
      alert('Failed to load solution');
    }
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="fixed top-[60px] left-0 right-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <Link 
              href="/playground"
              className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Playground
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-[57px] container mx-auto px-4 py-8 max-w-7xl">
        {/* Layout: Sidebar + Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar: Level Selector */}
          <div className="lg:col-span-1">
            <LevelSelector
              level={level}
              currentLevel={currentLevel}
              completedLevels={completedLevels}
              showHint={showHint}
              showSolution={showSolution}
              levels={levels}
              onHintToggle={() => setShowHint(!showHint)}
              onSolutionToggle={() => setShowSolution(!showSolution)}
              onLoadSolution={loadSolution}
              onGoToLevel={goToLevel}
              jwtLevelExplanations={jwtLevelExplanations}
              jwtSolutions={jwtSolutions}
            />
          </div>

          {/* Main Content: Form + Preview + History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Success Modal */}
            {showSuccess && (
              <SuccessModal
                currentLevel={currentLevel}
                totalLevels={levels.length}
                explanation={jwtLevelExplanations[currentLevel]}
                onNext={nextLevel}
              />
            )}

            {/* Two Panel Layout: Token Forger + Live Preview */}
            <div className="grid lg:grid-cols-2 gap-6">
              <TokenForger
                header={header}
                payload={payload}
                signature={signature}
                showSignature={showSignature}
                onHeaderChange={setHeader}
                onPayloadChange={setPayload}
                onSignatureChange={setSignature}
                onShowSignatureToggle={() => setShowSignature(!showSignature)}
                onSubmit={handleForgeToken}
                onReset={resetLevel}
              />

              <LivePreview
                token={generateJWTPreview(header, payload, signature)}
                header={header}
                payload={payload}
                signature={signature}
                showSignature={showSignature}
                copiedId={copiedId}
                onCopy={copyToClipboard}
              />
            </div>

            {/* Attempts History */}
            <AttemptsHistory
              attempts={attempts}
              copiedId={copiedId}
              onCopy={copyToClipboard}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
