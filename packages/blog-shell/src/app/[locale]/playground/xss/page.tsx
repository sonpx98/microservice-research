'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, RotateCcw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
  levelExplanations, 
  levels, 
  XSSAlertModal, 
  XSSLevelSelector,
  XSSSuccessModal,
  XSSCommentForm,
  XSSCommentsList,
} from './components';

// XSS payload detection function
function executeXSSPayload(html: string): { success: boolean; message?: string } {
  // Check for common XSS patterns
  const xssPatterns = [
    /<script[^>]*>/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<img[^>]*onerror/i,
    /<svg[^>]*onload/i,
    /<body[^>]*onload/i,
    /eval\s*\(/i,
    /alert\s*\(/i,
    /document\.cookie/i,
    /document\.location/i,
  ];

  for (const pattern of xssPatterns) {
    if (pattern.test(html)) {
      return { success: true, message: 'XSS payload detected!' };
    }
  }
  
  return { success: false };
}

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
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <div className="flex items-center gap-2 flex-wrap">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <Skeleton key={i} className="w-8 h-8 rounded-full" />
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
          <Skeleton className="h-64 w-full" />
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
              <XSSSuccessModal
                currentLevel={currentLevel}
                totalLevels={levels.length}
                explanation={levelExplanations[currentLevel]}
                onNextLevel={nextLevel}
              />
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetLevel}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>

                {/* Comment Form */}
                <XSSCommentForm
                  comment={comment}
                  hasFilter={!!level.filter}
                  onCommentChange={setComment}
                  onSubmit={handleSubmit}
                />

                {/* Comments List */}
                <XSSCommentsList comments={comments} />
              </div>
            </div>

            {/* Security Tips Section */}
            <div className="p-6 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
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
