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
  Code,
  AlertTriangle
} from 'lucide-react';

import { levelExplanations, levels, SafeCommentRender, XSSAlertModal, XSSLevelSelector } from './components';

export default function XSSChallengePage() {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Array<{id: number; text: string; rendered: string}>>([]);
  const [showHint, setShowHint] = useState(false);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load saved progress from localStorage on mount
  useEffect(() => {
    const savedLevel = localStorage.getItem('xss-challenge-level');
    const savedCompleted = localStorage.getItem('xss-challenge-completed');
    
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

  // Save progress to localStorage when it changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('xss-challenge-level', String(currentLevel));
    }
  }, [currentLevel, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('xss-challenge-completed', JSON.stringify(completedLevels));
    }
  }, [completedLevels, isHydrated]);

  const level = levels.find(l => l.id === currentLevel)!;

  const handleSubmit = useCallback(() => {
    if (!comment.trim()) return;

    const filteredComment = level.filter ? level.filter(comment) : comment;
    
    const newComment = {
      id: Date.now(),
      text: comment,
      rendered: filteredComment,
    };

    setComments(prev => [...prev, newComment]);
    
    // Execute XSS payload safely and detect if it triggers
    const detection = executeXSSPayload(filteredComment);
    if (detection.success) {
      setAlertMessage(detection.message || 'XSS');
      setShowSuccess(true);
      if (!completedLevels.includes(currentLevel)) {
        setCompletedLevels(prev => [...prev, currentLevel]);
      }
    }

    setComment('');
  }, [comment, level, currentLevel, completedLevels]);

  const resetLevel = () => {
    setComments([]);
    setShowSuccess(false);
    setShowHint(false);
    setAlertMessage(null);
  };

  const resetAllProgress = () => {
    setCurrentLevel(1);
    setCompletedLevels([]);
    setComments([]);
    setShowSuccess(false);
    setShowHint(false);
    setAlertMessage(null);
    localStorage.removeItem('xss-challenge-level');
    localStorage.removeItem('xss-challenge-completed');
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

  // Show loading state until hydrated to prevent flash
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Header Skeleton */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="flex items-center gap-2 flex-wrap">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Challenge Header Skeleton */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div>
                <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
          </div>
          
          {/* Level Info Skeleton */}
          <div className="mb-6 p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3" />
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          
          {/* Blog Post Skeleton */}
          <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6">
            <div className="h-6 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
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
            <XSSLevelSelector
              level={level}
              currentLevel={currentLevel}
              completedLevels={completedLevels}
              showHint={showHint}
              levels={levels}
              onHintToggle={() => setShowHint(!showHint)}
              onGoToLevel={goToLevel}
            />
          </div>

          {/* Main Content: Blog + Comments + History */}
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
                    🎉 XSS Attack Successful!
                  </h3>
                  <p className="text-green-700 dark:text-green-300 text-sm">
                    You&apos;ve successfully exploited the XSS vulnerability in Level {currentLevel}!
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
                    {levelExplanations[currentLevel].attackName}
                  </h4>
                  <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
                    {levelExplanations[currentLevel].howItWorks}
                  </p>
                </div>

                <div className="pt-2 border-t border-green-300 dark:border-green-800/50">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Why It Succeeded
                  </h4>
                  <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
                    {levelExplanations[currentLevel].whyItSucceeds}
                  </p>
                </div>

                <div className="pt-2 border-t border-green-300 dark:border-green-800/50">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Real-World Impact
                  </h4>
                  <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
                    {levelExplanations[currentLevel].realWorldImpact}
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
                    🏆 Congratulations! You&apos;ve completed all XSS challenges!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fake Blog Post */}
        <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          {/* Blog Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              How to Stay Safe Online: Security Tips
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Posted by <span className="font-medium">admin</span> • December 5, 2025
            </p>
          </div>

          {/* Blog Content */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <p className="text-gray-700 dark:text-gray-300">
              Welcome to my blog about web security! Today we&apos;ll discuss how to protect yourself 
              from various online threats. Remember to always use strong passwords and enable 
              two-factor authentication on all your accounts...
            </p>
          </div>

          {/* Comments Section */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Comments ({comments.length})
              </h3>
              <button
                onClick={resetLevel}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>

            {/* Comment Form */}
            <div className="mb-6">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment... (try to inject some XSS!)"
                className="w-full p-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={3}
              />
              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {level.filter ? '⚠️ Some input filtering is active' : '🔓 No input filtering'}
                </p>
                <button
                  onClick={handleSubmit}
                  disabled={!comment.trim()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  Post Comment
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-500 py-8">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                comments.map((c) => (
                  <div 
                    key={c.id}
                    className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-orange-400 flex items-center justify-center text-white text-sm font-medium">
                        H
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">Hacker</span>
                      <span className="text-xs text-gray-500">just now</span>
                    </div>
                    {/* Safe render - shows code with highlighting, no execution */}
                    <SafeCommentRender html={c.rendered} />
                    {c.text !== c.rendered && (
                      <div className="mt-3 p-2 rounded bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                        <p className="text-xs text-yellow-700 dark:text-yellow-300">
                          ⚠️ <strong>Filtered:</strong> Some content was blocked
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Security Tips Section */}
        <div className="mt-8 p-6 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-4">
            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                How to Prevent XSS Attacks
              </h3>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <span><strong>Sanitize all user input</strong> - Use libraries like DOMPurify to clean HTML</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <span><strong>Escape output</strong> - Convert special characters to HTML entities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <span><strong>Use Content Security Policy (CSP)</strong> - Restrict script sources</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <span><strong>Set HttpOnly cookies</strong> - Prevent JavaScript from accessing session cookies</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
          </div>

          {/* XSS Alert Modal */}
          {alertMessage && (
            <XSSAlertModal 
              message={alertMessage} 
              onClose={() => setAlertMessage(null)} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
