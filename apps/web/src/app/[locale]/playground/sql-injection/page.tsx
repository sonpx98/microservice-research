'use client';

import { useState, useCallback, useEffect } from 'react';
import { Database, Shield } from 'lucide-react';
import { CodeBlock } from '@/components/ui/code-block';
import { Callout, LabShell } from '@/components/layout';
import { AttemptsHistory, LabLoading, LevelSelector, ResultDialog, SuccessPanel } from '../_kit';
import { levels, sqlLevelExplanations, SQLLoginForm } from './components';

export default function SQLInjectionPage() {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [attempts, setAttempts] = useState<Array<{id: number; username: string; password: string; result: any}>>([]);
  const [showHint, setShowHint] = useState(false);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [alertData, setAlertData] = useState<{message: string; data?: any; query: string} | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load saved progress from localStorage
  useEffect(() => {
    const savedLevel = localStorage.getItem('sql-injection-level');
    const savedCompleted = localStorage.getItem('sql-injection-completed');
    
    if (savedLevel) {
      setCurrentLevel(parseInt(savedLevel, 10));
    }
    if (savedCompleted) {
      try {
        setCompletedLevels(JSON.parse(savedCompleted));
      } catch {
        // Invalid JSON, ignore
      }
    }
    setIsHydrated(true);
  }, []);

  // Save progress
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('sql-injection-level', String(currentLevel));
    }
  }, [currentLevel, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('sql-injection-completed', JSON.stringify(completedLevels));
    }
  }, [completedLevels, isHydrated]);

  const level = levels.find(l => l.id === currentLevel)!;

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    const result = level.validateInput(username, password);
    
    const newAttempt = {
      id: Date.now(),
      username,
      password,
      result,
    };

    setAttempts(prev => [...prev, newAttempt]);
    
    if (result.success) {
      setAlertData({ message: result.message, data: result.data, query: result.query });
      setShowSuccess(true);
      if (!completedLevels.includes(currentLevel)) {
        setCompletedLevels(prev => [...prev, currentLevel]);
      }
    }

    setUsername('');
    setPassword('');
  }, [username, password, level, currentLevel, completedLevels]);

  const resetLevel = () => {
    setAttempts([]);
    setShowSuccess(false);
    setShowHint(false);
    setAlertData(null);
    setUsername('');
    setPassword('');
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

  const title = 'SQL injection';
  if (!isHydrated) return <LabLoading title={title} />;

  return (
    <LabShell
      title={title}
      description="Bypass a login form whose query is built by string concatenation."
      sidebar={
        <LevelSelector
          levels={levels}
          currentLevel={currentLevel}
          completedLevels={completedLevels}
          showHint={showHint}
          onHintToggle={() => setShowHint(!showHint)}
          onGoToLevel={goToLevel}
        />
      }
    >
      {showSuccess && (
        <SuccessPanel
          title="SQL injection succeeded"
          currentLevel={currentLevel}
          totalLevels={levels.length}
          explanation={sqlLevelExplanations[currentLevel]}
          onNext={nextLevel}
          completeMessage="You have completed every SQL injection level."
        />
      )}

      <SQLLoginForm
        username={username}
        password={password}
        onUsernameChange={setUsername}
        onPasswordChange={setPassword}
        onSubmit={handleSubmit}
        onReset={resetLevel}
      />

      <AttemptsHistory
        title="Login attempts"
        attempts={[...attempts].reverse().map((a) => ({
          id: a.id,
          success: a.result.success,
          message: a.result.message,
          detail: (
            <>
              User: <span className="font-mono text-warning">{a.username}</span>
            </>
          ),
        }))}
      />

      <Callout tone="primary" icon={Shield} title="How to prevent SQL injection">
        <ul className="flex list-disc flex-col gap-1 pl-4">
          <li><strong>Use parameterized queries.</strong> Never concatenate user input into SQL.</li>
          <li><strong>Use an ORM or query builder</strong> such as Prisma or TypeORM that escapes for you.</li>
          <li><strong>Validate input</strong> against an allow-list of characters.</li>
          <li><strong>Apply least privilege</strong> so the database user can do as little as possible.</li>
        </ul>
      </Callout>

      <ResultDialog
        open={alertData !== null}
        onClose={() => setAlertData(null)}
        icon={Database}
        title="SQL injection succeeded"
        description={alertData?.message ?? ''}
      >
        <div className="flex flex-col gap-1">
          <p className="font-mono text-xs text-muted-foreground">Executed query</p>
          <CodeBlock tone="success">{alertData?.query}</CodeBlock>
        </div>
        {alertData?.data && (
          <div className="flex flex-col gap-1">
            <p className="font-mono text-xs text-muted-foreground">Extracted data</p>
            <CodeBlock className="max-h-40 overflow-y-auto">{JSON.stringify(alertData.data, null, 2)}</CodeBlock>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          In a real attack this could expose data, bypass authentication or drop tables.
        </p>
      </ResultDialog>
    </LabShell>
  );
}
