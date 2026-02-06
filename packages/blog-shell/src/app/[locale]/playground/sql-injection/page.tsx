'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  levels, 
  sqlLevelExplanations, 
  SQLAlertModal, 
  SQLLevelSelector,
  SQLSuccessModal,
  SQLLoginForm,
  SQLAttemptsHistory,
} from './components';

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

  // Loading skeleton
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <div className="flex items-center gap-1.5 flex-wrap">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <Skeleton key={i} className="w-7 h-7 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="fixed top-[60px] left-0 right-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <Link 
            href="/playground"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Playground
          </Link>
        </div>
      </div>

      <div className="mt-[57px] container mx-auto px-4 py-8 max-w-7xl">
        {/* Layout: Sidebar + Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar: Level Selector */}
          <div className="lg:col-span-1">
            <SQLLevelSelector
              level={level}
              currentLevel={currentLevel}
              completedLevels={completedLevels}
              showHint={showHint}
              levels={levels}
              onHintToggle={() => setShowHint(!showHint)}
              onGoToLevel={goToLevel}
            />
          </div>

          {/* Main Content: Login + Database + Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Success Modal */}
            {showSuccess && (
              <SQLSuccessModal
                currentLevel={currentLevel}
                totalLevels={levels.length}
                explanation={sqlLevelExplanations[currentLevel]}
                onNextLevel={nextLevel}
              />
            )}

            {/* Login Form */}
            <SQLLoginForm
              username={username}
              password={password}
              onUsernameChange={setUsername}
              onPasswordChange={setPassword}
              onSubmit={handleSubmit}
            />

            {/* Attempts History */}
            <SQLAttemptsHistory
              attempts={attempts}
              onReset={resetLevel}
            />

            {/* Security Tips */}
            <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-6">
              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    How to Prevent SQL Injection
                  </h3>
                  <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                      <span><strong>Use Parameterized Queries</strong> - Never concatenate user input into SQL</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                      <span><strong>Use ORM libraries</strong> - Sequelize, Prisma, TypeORM handle escaping</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                      <span><strong>Input Validation</strong> - Whitelist allowed characters</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                      <span><strong>Least Privilege</strong> - Database users should have minimal permissions</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SQL Alert Modal */}
      {alertData && (
        <SQLAlertModal 
          message={alertData.message}
          data={alertData.data}
          query={alertData.query}
          onClose={() => setAlertData(null)} 
        />
      )}
    </div>
  );
}
