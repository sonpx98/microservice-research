'use client';

import { useState, useCallback, useEffect } from 'react';
import { AlertTriangle, RotateCcw, Shield } from 'lucide-react';
import { Callout, LabShell, Panel } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { CodeBlock } from '@/components/ui/code-block';
import { LabLoading, LevelSelector, ResultDialog, SuccessPanel } from '../_kit';
import { levelExplanations, levels, XSSCommentForm, XSSCommentsList } from './components';

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

  const title = 'Cross-site scripting (XSS)';
  if (!isHydrated) return <LabLoading title={title} />;

  return (
    <LabShell
      title={title}
      description="Get a script to run through the comment box of a vulnerable blog."
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
          title="XSS attack succeeded"
          currentLevel={currentLevel}
          totalLevels={levels.length}
          explanation={levelExplanations[currentLevel]}
          onNext={nextLevel}
          completeMessage="You have completed every XSS level."
        />
      )}

      <Panel
        title="How to Stay Safe Online: Security Tips"
        description="Posted by admin · December 5, 2025"
        padding="none"
      >
        <p className="border-b border-border p-6 text-sm text-foreground">
          Welcome to my blog about web security! Today we&apos;ll discuss how to protect yourself from various
          online threats. Remember to always use strong passwords and enable two-factor authentication on all your
          accounts...
        </p>
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">Comments ({comments.length})</h4>
            <Button variant="ghost" size="sm" onClick={resetLevel}>
              <RotateCcw />
              Reset
            </Button>
          </div>
          <XSSCommentForm
            comment={comment}
            hasFilter={!!level.filter}
            onCommentChange={setComment}
            onSubmit={handleSubmit}
          />
          <XSSCommentsList comments={comments} />
        </div>
      </Panel>

      <Callout tone="primary" icon={Shield} title="How to prevent XSS">
        <ul className="flex list-disc flex-col gap-1 pl-4">
          <li><strong>Sanitize user input</strong> with a library such as DOMPurify.</li>
          <li><strong>Escape output</strong> by converting special characters to HTML entities.</li>
          <li><strong>Set a Content Security Policy</strong> that restricts script sources.</li>
          <li><strong>Use HttpOnly cookies</strong> so scripts cannot read the session.</li>
        </ul>
      </Callout>

      <ResultDialog
        open={alertMessage !== null}
        onClose={() => setAlertMessage(null)}
        icon={AlertTriangle}
        title="XSS alert"
        description="The injected script ran in the victim's browser."
      >
        <CodeBlock tone="success">{alertMessage}</CodeBlock>
        <p className="text-xs text-muted-foreground">
          In a real attack this could steal cookies, redirect users or rewrite the page.
        </p>
      </ResultDialog>
    </LabShell>
  );
}
