'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Skull, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  NetworkRequest, 
  VictimSiteTab, 
  MalwareSiteTab, 
  levels, 
  csrfLevelExplanations,
  csrfSolutions,
  CSRFLevelSelector,
  CSRFSuccessModal,
  CSRFAttemptsHistory,
} from './components';

// Validation logic extracted as a function
function validatePayload(input: string, currentLevel: number) {
  const isFromAttackerOrigin = (payload: string) => {
    const hasEvilDomain = payload.includes('evil.com') || 
                         payload.includes('localhost') || 
                         payload.includes('127.0.0.1') ||
                         payload.includes('attacker') ||
                         payload.includes('hacker');
    return hasEvilDomain;
  };

  switch (currentLevel) {
    case 1:
      if (input.includes('<form') && 
          input.includes('transfer') && 
          input.includes('attacker@evil.com') &&
          isFromAttackerOrigin(input)) {
        return { success: true, message: '🎯 Form-based CSRF crafted! The bank transferred money without verification.' };
      }
      if (input.includes('<form') && input.includes('transfer') && input.includes('attacker@evil.com') && !isFromAttackerOrigin(input)) {
        return { success: false, message: '❌ Form created but not from attacker\'s domain! The server checks Origin/Referer headers.' };
      }
      break;
    case 2:
      if (input.includes('token_5') || input.includes('next_token')) {
        return { success: true, message: '🔮 Predictable token guessed! You calculated the next sequential token.' };
      }
      break;
    case 3:
      if (input.includes('reusable_csrf_token') && input.split('reusable_csrf_token').length >= 3) {
        return { success: true, message: '♻️ Token reused! The same token worked for multiple requests.' };
      }
      break;
    case 4:
      if (input.includes('window.location') || input.includes('top-level') || input.includes('<a href')) {
        return { success: true, message: '🔗 SameSite bypassed! Top-level navigation included cookies despite SameSite=Lax.' };
      }
      break;
    case 5:
      if (input.includes('<form') && !input.includes('X-Requested-With')) {
        return { success: true, message: '📝 Custom header bypassed! Regular forms don\'t include custom headers.' };
      }
      break;
    case 6:
      if (input.includes('subdomain') || input.includes('parent_domain_cookie_token')) {
        return { success: true, message: '🌐 Domain scope exploited! Subdomain cookies bypassed the validation.' };
      }
      break;
    case 7:
      if (input.includes('application/x-www-form-urlencoded') || input.includes('form-encoded')) {
        return { success: true, message: '🔀 Content-Type mismatch! API misinterpreted the request type.' };
      }
      break;
    case 8:
      if (input.includes('<iframe') && input.includes('opacity') || input.includes('z-index')) {
        return { success: true, message: '🎭 Clickjacking executed! User clicked on hidden button.' };
      }
      break;
    case 9:
      if (input.includes('session') && input.includes('fixed_session_csrf_token')) {
        return { success: true, message: '🔐 Session fixed + CSRF! Attacker controlled both session and token.' };
      }
      break;
    case 10:
      if (input.includes('state') && !input.includes('validate')) {
        return { success: true, message: '🔓 OAuth state bypassed! Callback didn\'t validate state parameter properly.' };
      }
      break;
  }
  return { success: false, message: '❌ Attack failed. Check the hint and try again!' };
}

export default function CSRFChallengePage() {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [payload, setPayload] = useState('');
  const [attempts, setAttempts] = useState<Array<{id: number; payload: string; result: {success: boolean; message: string}}>>([]);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [victimBalance, setVictimBalance] = useState(10000);
  const [victimEmail, setVictimEmail] = useState('victim@bank.com');
  const [attackerBalance, setAttackerBalance] = useState(0);
  const [networkRequests, setNetworkRequests] = useState<NetworkRequest[]>([]);
  const [isAttacking, setIsAttacking] = useState(false);

  // Load saved progress from localStorage
  useEffect(() => {
    const savedLevel = localStorage.getItem('csrf-challenge-level');
    const savedCompleted = localStorage.getItem('csrf-challenge-completed');
    
    if (savedLevel) setCurrentLevel(parseInt(savedLevel, 10));
    if (savedCompleted) {
      try { setCompletedLevels(JSON.parse(savedCompleted)); } catch { /* ignore */ }
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) localStorage.setItem('csrf-challenge-level', String(currentLevel));
  }, [currentLevel, isHydrated]);

  useEffect(() => {
    if (isHydrated) localStorage.setItem('csrf-challenge-completed', JSON.stringify(completedLevels));
  }, [completedLevels, isHydrated]);

  const level = levels.find(l => l.id === currentLevel)!;

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!payload.trim()) return;

    const result = validatePayload(payload, currentLevel);
    setAttempts(prev => [...prev, { id: Date.now(), payload, result }]);

    if (result.success) {
      // Extract values from payload
      const extractValue = (key: string): string | null => {
        const inputMatch = payload.match(new RegExp(`name="${key}"\\s+value="([^"]+)"`, 'i'));
        if (inputMatch) return inputMatch[1];
        const urlMatch = payload.match(new RegExp(`[?&]${key}=([^&\\s"']+)`, 'i'));
        if (urlMatch) return urlMatch[1];
        const bodyMatch = payload.match(new RegExp(`${key}=([^&\\s"']+)`, 'i'));
        if (bodyMatch) return bodyMatch[1];
        return null;
      };

      const transferAmount = parseInt(extractValue('amount') || '100', 10);
      const recipientEmail = extractValue('to') || extractValue('email') || 'attacker@evil.com';
      const actionMatch = payload.match(/action="([^"]+)"/i);
      const fetchMatch = payload.match(/fetch\(["']([^"']+)["']/i);
      const windowLocationMatch = payload.match(/window\.location\s*=\s*["']([^"']+)["']/i);
      const targetUrl = actionMatch?.[1] || fetchMatch?.[1] || windowLocationMatch?.[1] || 'https://bank.com/transfer';

      setIsAttacking(true);
      
      const newRequest: NetworkRequest = {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        method: 'POST',
        url: targetUrl,
        origin: 'https://evil.com',
        headers: {
          'Host': 'bank.com',
          'Origin': 'https://evil.com',
          'Referer': 'https://evil.com/malicious-page',
          'Cookie': 'session_id=abc123xyz; auth_token=victim_secure_token; user_id=12345',
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        },
        body: currentLevel === 9 
          ? `email=${recipientEmail}&csrf_token=fixed_session_csrf_token`
          : `to=${recipientEmail}&amount=${transferAmount}&confirm=yes`,
        status: 200,
        statusText: 'OK',
      };
      setNetworkRequests(prev => [newRequest, ...prev]);

      setTimeout(() => {
        if (currentLevel <= 3 || currentLevel === 6 || currentLevel === 7) {
          setVictimBalance(prev => Math.max(0, prev - transferAmount));
          setAttackerBalance(prev => prev + transferAmount);
        }
        if (currentLevel === 9) setVictimEmail(recipientEmail);
        
        setIsAttacking(false);
        setShowSuccess(true);
        if (!completedLevels.includes(currentLevel)) {
          setCompletedLevels(prev => [...prev, currentLevel]);
        }
      }, 1500);
    }
  }, [payload, currentLevel, completedLevels]);

  const resetLevel = () => {
    setAttempts([]);
    setShowSuccess(false);
    setShowHint(false);
    setShowSolution(false);
    setVictimBalance(10000);
    setVictimEmail('victim@bank.com');
    setAttackerBalance(0);
    setNetworkRequests([]);
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

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
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
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <CSRFLevelSelector
              level={level}
              currentLevel={currentLevel}
              completedLevels={completedLevels}
              showHint={showHint}
              showSolution={showSolution}
              levels={levels}
              onHintToggle={() => setShowHint(!showHint)}
              onSolutionToggle={() => setShowSolution(!showSolution)}
              onGoToLevel={goToLevel}
              csrfLevelExplanations={csrfLevelExplanations}
              csrfSolutions={csrfSolutions}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Success Modal */}
            {showSuccess && (
              <CSRFSuccessModal
                currentLevel={currentLevel}
                totalLevels={levels.length}
                explanation={csrfLevelExplanations[currentLevel]}
                onNextLevel={nextLevel}
              />
            )}

            {/* Two-Panel Layout: Malware Site + Victim Site */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Malware Site Panel */}
              <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-red-50 dark:bg-red-900/20 flex items-center gap-2">
                  <Skull className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <h3 className="font-semibold text-red-700 dark:text-red-300">Malware Site (Attacker)</h3>
                </div>
                <MalwareSiteTab
                  payload={payload}
                  setPayload={setPayload}
                  handleSubmit={handleSubmit}
                  isAttacking={isAttacking}
                  attackerBalance={attackerBalance}
                  resetLevel={resetLevel}
                  currentLevel={currentLevel}
                />
              </div>

              {/* Victim Site Panel */}
              <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-blue-50 dark:bg-blue-900/20 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-semibold text-blue-700 dark:text-blue-300">Victim Site (Bank)</h3>
                </div>
                <VictimSiteTab
                  victimEmail={victimEmail}
                  victimBalance={victimBalance}
                  networkRequests={networkRequests}
                  isAttacking={isAttacking}
                  attackerBalance={attackerBalance}
                />
              </div>
            </div>

            {/* Attempts History */}
            <CSRFAttemptsHistory
              attempts={attempts}
              copiedId={copiedId}
              onReset={resetLevel}
              onCopy={copyToClipboard}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
