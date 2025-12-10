'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft,
  Shield,
  Lightbulb,
  CheckCircle2,
  RotateCcw,
  ChevronRight,
  Trophy,
  Terminal,
  Database,
  User,
  Lock,
  AlertTriangle,
  Code
} from 'lucide-react';
import { levels, sqlLevelExplanations, SQLAlertModal, SQLLevelSelector } from './components';

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

  const resetAllProgress = () => {
    setCurrentLevel(1);
    setCompletedLevels([]);
    resetLevel();
    localStorage.removeItem('sql-injection-level');
    localStorage.removeItem('sql-injection-completed');
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
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="flex items-center gap-1.5 flex-wrap">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div>
                <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
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
        <div className="container mx-auto px-4 py-4">
          <Link 
            href="/playground"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Playground
          </Link>
        </div>
      </div>

      <div className="mt-[57px] container mx-auto px-4 py-8">
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
              <div className="mb-6 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 animate-in slide-in-from-top-4 overflow-hidden">
                {/* Success Header */}
                <div className="p-6 border-b border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-1">
                        🎉 SQL Injection Successful!
                      </h3>
                      <p className="text-green-700 dark:text-green-300 text-sm">
                        You&apos;ve successfully exploited the SQL vulnerability in Level {currentLevel}!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Attack Explanation */}
                <div className="p-6 border-b border-green-200 dark:border-green-800 bg-green-100/30 dark:bg-green-900/10">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                        <Code className="w-4 h-4" />
                        {sqlLevelExplanations[currentLevel].attackName}
                      </h4>
                      <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
                        {sqlLevelExplanations[currentLevel].howItWorks}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-green-300 dark:border-green-800/50">
                      <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Why It Succeeded
                      </h4>
                      <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
                        {sqlLevelExplanations[currentLevel].whyItSucceeds}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-green-300 dark:border-green-800/50">
                      <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Real-World Impact
                      </h4>
                      <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
                        {sqlLevelExplanations[currentLevel].realWorldImpact}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-6">
                  {currentLevel < levels.length ? (
                    <button
                      onClick={nextLevel}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Next Level
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="p-4 rounded-lg bg-green-100 dark:bg-green-900/30">
                      <p className="text-green-800 dark:text-green-200 font-medium">
                        🏆 Congratulations! You&apos;ve completed all SQL Injection challenges!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Login Form */}
            <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
              {/* Form Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Secure Login Portal</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Enter your credentials to access the system</p>
                  </div>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username..."
                      className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Lock className="w-4 h-4 inline mr-2" />
                      Password
                    </label>
                    <input
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password..."
                      className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6">
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    🔓 SQL Query visible below
                  </p>
                  <button
                    type="submit"
                    disabled={!username.trim()}
                    className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                  >
                    Login
                  </button>
                </div>
              </form>

              {/* Query Preview */}
              <div className="px-6 pb-6">
                <div className="p-4 rounded-lg bg-gray-900 dark:bg-black border border-gray-700">
                  <p className="text-xs text-gray-400 mb-2 flex items-center gap-2">
                    <Database className="w-3 h-3" />
                    SQL Query Preview:
                  </p>
                  <code className="text-sm text-green-400 font-mono break-all">
                    SELECT * FROM users WHERE username={`'${username || "..."}'`} AND password={`'${password || "..."}'`}
                  </code>
                </div>
              </div>

              {/* Attempts History */}
              <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Attempts ({attempts.length})
                    </h3>
                    <button
                      onClick={resetLevel}
                      className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-3 max-h-60 overflow-y-auto">
                  {attempts.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-500 py-8">
                      No attempts yet. Try to bypass the login!
                    </p>
                  ) : (
                    attempts.map((attempt) => (
                      <div 
                        key={attempt.id}
                        className={`p-3 rounded-lg border ${
                          attempt.result.success 
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {attempt.result.success ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">
                              User: <span className="text-orange-600 dark:text-orange-400">{attempt.username}</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{attempt.result.message}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

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
