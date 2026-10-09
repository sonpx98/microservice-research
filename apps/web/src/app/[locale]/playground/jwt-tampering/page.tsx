'use client';

import { useState, useCallback, useEffect } from 'react';
import { LabShell } from '@/components/layout';
import { AttemptsHistory, LabLoading, LevelSelector, SuccessPanel } from '../_kit';
import { TokenForger, LivePreview, jwtLevelExplanations, jwtSolutions, levels } from './components';
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

  const title = 'JWT tampering';
  if (!isHydrated) return <LabLoading title={title} />;

  return (
    <LabShell
      title={title}
      description="Forge a token the server accepts by abusing how it verifies signatures."
      sidebar={
        <LevelSelector
          levels={levels}
          currentLevel={currentLevel}
          completedLevels={completedLevels}
          showHint={showHint}
          onHintToggle={() => setShowHint(!showHint)}
          onGoToLevel={goToLevel}
          solution={{
            code: jwtSolutions[currentLevel],
            visible: showSolution,
            onToggle: () => setShowSolution(!showSolution),
            onLoad: loadSolution,
          }}
        />
      }
    >
      {showSuccess && (
        <SuccessPanel
          title={`Level ${currentLevel} complete`}
          currentLevel={currentLevel}
          totalLevels={levels.length}
          explanation={jwtLevelExplanations[currentLevel]}
          onNext={nextLevel}
          completeMessage="You have completed every JWT level."
        />
      )}

      <div className="grid gap-6 xl:grid-cols-2">
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

      <AttemptsHistory
        title="Forge attempts"
        attempts={[...attempts].reverse().map((a) => ({
          id: a.id,
          success: a.result.success,
          message: a.result.message,
          payload: a.token,
        }))}
        copiedId={copiedId}
        onCopy={copyToClipboard}
      />
    </LabShell>
  );
}
