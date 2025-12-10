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
  AlertTriangle,
  Copy,
  Skull,
  User
} from 'lucide-react';
import { NetworkRequest, VictimSiteTab, MalwareSiteTab, levels, csrfSolutions, csrfLevelExplanations, CSRFLevelSelector } from './components';

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

  // Save progress to localStorage
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('csrf-challenge-level', String(currentLevel));
    }
  }, [currentLevel, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('csrf-challenge-completed', JSON.stringify(completedLevels));
    }
  }, [completedLevels, isHydrated]);

  const level = levels.find(l => l.id === currentLevel)!;

  const validatePayload = (input: string) => {
    // Helper function to check if payload is from attacker's domain
    const isFromAttackerOrigin = (payload: string) => {
      // Must contain attacker's domain (evil.com, localhost, or hacker-like domains)
      const hasEvilDomain = payload.includes('evil.com') || 
                           payload.includes('localhost') || 
                           payload.includes('127.0.0.1') ||
                           payload.includes('attacker') ||
                           payload.includes('hacker');
      return hasEvilDomain;
    };

    switch (currentLevel) {
      case 1:
        // Check for hidden form structure from attacker's origin
        if (input.includes('<form') && 
            input.includes('transfer') && 
            input.includes('attacker@evil.com') &&
            isFromAttackerOrigin(input)) {
          return {
            success: true,
            message: '🎯 Form-based CSRF crafted! The bank transferred money without verification.',
          };
        }
        // Reject if no attacker origin
        if (input.includes('<form') && 
            input.includes('transfer') && 
            input.includes('attacker@evil.com') &&
            !isFromAttackerOrigin(input)) {
          return {
            success: false,
            message: '❌ Form created but not from attacker\'s domain! The server checks Origin/Referer headers.',
          };
        }
        break;
      case 2:
        // Token generation is predictable
        if (input.includes('token_5') || input.includes('next_token')) {
          return {
            success: true,
            message: '🔮 Predictable token guessed! You calculated the next sequential token.',
          };
        }
        break;
      case 3:
        // Reuse the same token twice
        if (input.includes('reusable_csrf_token') && input.split('reusable_csrf_token').length >= 3) {
          return {
            success: true,
            message: '♻️ Token reused! The same token worked for multiple requests.',
          };
        }
        break;
      case 4:
        // SameSite bypass using navigation
        if (input.includes('window.location') || input.includes('top-level') || input.includes('<a href')) {
          return {
            success: true,
            message: '🔗 SameSite bypassed! Top-level navigation included cookies despite SameSite=Lax.',
          };
        }
        break;
      case 5:
        // Bypass custom header with form
        if (input.includes('<form') && !input.includes('X-Requested-With')) {
          return {
            success: true,
            message: '📝 Custom header bypassed! Regular forms don\'t include custom headers.',
          };
        }
        break;
      case 6:
        // Subdomain cookie scope issue
        if (input.includes('subdomain') || input.includes('parent_domain_cookie_token')) {
          return {
            success: true,
            message: '🌐 Domain scope exploited! Subdomain cookies bypassed the validation.',
          };
        }
        break;
      case 7:
        // Content-Type confusion
        if (input.includes('application/x-www-form-urlencoded') || input.includes('form-encoded')) {
          return {
            success: true,
            message: '🔀 Content-Type mismatch! API misinterpreted the request type.',
          };
        }
        break;
      case 8:
        // Clickjacking with iframe overlay
        if (input.includes('<iframe') && input.includes('opacity') || input.includes('z-index')) {
          return {
            success: true,
            message: '🎭 Clickjacking executed! User clicked on hidden button.',
          };
        }
        break;
      case 9:
        // Session fixation + CSRF
        if (input.includes('session') && input.includes('fixed_session_csrf_token')) {
          return {
            success: true,
            message: '🔐 Session fixed + CSRF! Attacker controlled both session and token.',
          };
        }
        break;
      case 10:
        // OAuth state bypass
        if (input.includes('state') && !input.includes('validate')) {
          return {
            success: true,
            message: '🔓 OAuth state bypassed! Callback didn\'t validate state parameter properly.',
          };
        }
        break;
      default:
        break;
    }
    return {
      success: false,
      message: '❌ Attack failed. Check the hint and try again!',
    };
  };

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!payload.trim()) return;

    const result = validatePayload(payload);
    const newAttempt = {
      id: Date.now(),
      payload,
      result,
    };

    setAttempts(prev => [...prev, newAttempt]);

    if (result.success) {
      // Extract values from payload for realistic simulation
      const extractValue = (key: string): string | null => {
        // Try to extract from input value attributes
        const inputMatch = payload.match(new RegExp(`name="${key}"\\s+value="([^"]+)"`, 'i'));
        if (inputMatch) return inputMatch[1];
        
        // Try to extract from URL query params
        const urlMatch = payload.match(new RegExp(`[?&]${key}=([^&\\s"']+)`, 'i'));
        if (urlMatch) return urlMatch[1];
        
        // Try to extract from body string
        const bodyMatch = payload.match(new RegExp(`${key}=([^&\\s"']+)`, 'i'));
        if (bodyMatch) return bodyMatch[1];
        
        return null;
      };

      const extractedAmount = extractValue('amount');
      const extractedRecipient = extractValue('to');
      const extractedEmail = extractValue('email');
      const transferAmount = extractedAmount ? parseInt(extractedAmount, 10) : 100;
      const recipientEmail = extractedRecipient || extractedEmail || 'attacker@evil.com';
      
      // Extract target URL from action attribute or fetch URL
      const actionMatch = payload.match(/action="([^"]+)"/i);
      const fetchMatch = payload.match(/fetch\(["']([^"']+)["']/i);
      const windowLocationMatch = payload.match(/window\.location\s*=\s*["']([^"']+)["']/i);
      const targetUrl = actionMatch?.[1] || fetchMatch?.[1] || windowLocationMatch?.[1] || 'https://bank.com/transfer';

      // Simulate attack effects on victim
      setIsAttacking(true);
      
      // Generate network request data with extracted values
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

      // Simulate victim state changes after 1 second
      setTimeout(() => {
        // Transfer money with extracted amount
        if (currentLevel <= 3 || currentLevel === 6 || currentLevel === 7) {
          setVictimBalance(prev => Math.max(0, prev - transferAmount));
          setAttackerBalance(prev => prev + transferAmount);
        }
        
        // Change email
        if (currentLevel === 9) {
          setVictimEmail(recipientEmail);
        }

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
    // Don't clear payload - let MalwareSiteTab regenerate it
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
            <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
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

          {/* Main Content: Tabs + History + Prevention */}
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
                    🎉 CSRF Attack Successful!
                  </h3>
                  <p className="text-green-700 dark:text-green-300 text-sm">
                    You&apos;ve successfully demonstrated the CSRF vulnerability in Level {currentLevel}!
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
                    {csrfLevelExplanations[currentLevel].attackName}
                  </h4>
                  <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
                    {csrfLevelExplanations[currentLevel].howItWorks}
                  </p>
                </div>

                <div className="pt-2 border-t border-green-300 dark:border-green-800/50">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Why It Succeeded
                  </h4>
                  <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
                    {csrfLevelExplanations[currentLevel].whyItSucceeds}
                  </p>
                </div>

                <div className="pt-2 border-t border-green-300 dark:border-green-800/50">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Real-World Impact
                  </h4>
                  <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
                    {csrfLevelExplanations[currentLevel].realWorldImpact}
                  </p>
                </div>

                <div className="pt-2 border-t border-green-300 dark:border-green-800/50">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Prevention Tips</h4>
                  <ul className="space-y-2">
                    {csrfLevelExplanations[currentLevel].preventionTips.map((tip, idx) => (
                      <li key={idx} className="text-sm text-green-800 dark:text-green-200 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-600 mt-1.5 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
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
                    🏆 Congratulations! You&apos;ve completed all CSRF challenges!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Two-Panel Layout: Malware Site + Victim Site */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
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
            <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Attempts ({attempts.length})
                  </h3>
                  {attempts.length > 0 && (
                    <button
                      onClick={resetLevel}
                      className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-3 max-h-64 overflow-y-auto">
                {attempts.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-500 py-8">
                    No attempts yet. Craft your first CSRF exploit!
                  </p>
                ) : (
                  attempts.map((attempt) => (
                    <div 
                      key={attempt.id}
                      className={`p-4 rounded-lg border ${
                        attempt.result.success 
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                          : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        {attempt.result.success ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        )}
                        <button
                          onClick={() => copyToClipboard(attempt.payload, attempt.id)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          title="Copy to clipboard"
                        >
                          {copiedId === attempt.id ? '✓ Copied' : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mb-2 font-mono">{attempt.payload.slice(0, 100)}...</p>
                      <p className={`text-sm font-medium ${
                        attempt.result.success 
                          ? 'text-green-700 dark:text-green-300'
                          : 'text-red-700 dark:text-red-300'
                      }`}>
                        {attempt.result.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
