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
  Search
} from 'lucide-react';

interface SQLResult {
  success: boolean;
  message: string;
  data?: any;
  query: string;
}

interface Level {
  id: number;
  title: string;
  description: string;
  hint: string;
  type: 'login' | 'search' | 'user-lookup';
  validateInput: (username: string, password: string) => SQLResult;
}

interface User {
  id: number;
  username: string;
  password: string;
  role: string;
  email: string;
}

// Simulated database
const mockDatabase: User[] = [
  { id: 1, username: 'admin', password: 'sup3rs3cr3t!', role: 'admin', email: 'admin@example.com' },
  { id: 2, username: 'john', password: 'john123', role: 'user', email: 'john@example.com' },
  { id: 3, username: 'alice', password: 'alice456', role: 'user', email: 'alice@example.com' },
  { id: 4, username: 'bob', password: 'bobpass', role: 'moderator', email: 'bob@example.com' },
];

/**
 * Simulate SQL query execution with injection vulnerabilities
 */
function simulateSQLQuery(
  query: string, 
  level: number
): { success: boolean; message: string; data?: any; query: string } {
  // Show the "executed" query
  const displayQuery = query;
  
  // Level-specific SQL injection simulation
  switch (level) {
    case 1: {
      // Level 1: Basic - No protection, classic ' OR '1'='1
      // Query: SELECT * FROM users WHERE username='X' AND password='Y'
      if (query.includes("'1'='1'") || query.includes("' OR '") || query.includes("' or '") ||
          query.includes("1=1") || query.includes("''='")) {
        return {
          success: true,
          message: 'Login successful! You bypassed authentication.',
          data: mockDatabase[0],
          query: displayQuery
        };
      }
      break;
    }
    
    case 2: {
      // Level 2: Comment injection -- or #
      if (query.includes("--") || query.includes("#")) {
        // Extract username before comment
        const match = query.match(/username='([^']*)/);
        if (match) {
          const inputUser = match[1];
          if (inputUser.toLowerCase() === 'admin' || query.includes("admin'--") || query.includes("admin'#")) {
            return {
              success: true,
              message: 'Login successful! You used comment injection.',
              data: mockDatabase[0],
              query: displayQuery
            };
          }
        }
      }
      break;
    }
    
    case 3: {
      // Level 3: UNION-based injection
      if (query.toLowerCase().includes('union') && query.toLowerCase().includes('select')) {
        return {
          success: true,
          message: 'UNION attack successful! You extracted data from the database.',
          data: mockDatabase,
          query: displayQuery
        };
      }
      break;
    }
    
    case 4: {
      // Level 4: Blind SQL injection with OR
      // Filter blocks 'OR' but not 'or' or '||'
      if ((query.includes("||") || query.toLowerCase().includes(" or ")) && 
          (query.includes("1=1") || query.includes("'1'='1'"))) {
        return {
          success: true,
          message: 'Blind injection successful! Case sensitivity bypass worked.',
          data: mockDatabase[0],
          query: displayQuery
        };
      }
      break;
    }
    
    case 5: {
      // Level 5: Double encoding or alternate syntax
      // Blocks: OR, --, #, UNION
      // Bypass: Using /**/ comments or char encoding
      if (query.includes("/**/") || query.includes("CHAR(") || query.includes("char(") ||
          query.includes("||") || query.includes("&&")) {
        return {
          success: true,
          message: 'Advanced bypass successful! You used alternate syntax.',
          data: mockDatabase[0],
          query: displayQuery
        };
      }
      break;
    }
    
    case 6: {
      // Level 6: Time-based blind injection simulation
      if (query.toLowerCase().includes('sleep') || query.toLowerCase().includes('waitfor') ||
          query.toLowerCase().includes('benchmark') || query.toLowerCase().includes('pg_sleep')) {
        return {
          success: true,
          message: 'Time-based injection detected! In real scenarios, this would delay the response.',
          data: { timeDelayDetected: true },
          query: displayQuery
        };
      }
      break;
    }
    
    case 7: {
      // Level 7: Stacked queries
      if (query.includes(';') && (
          query.toLowerCase().includes('drop') ||
          query.toLowerCase().includes('insert') ||
          query.toLowerCase().includes('update') ||
          query.toLowerCase().includes('delete') ||
          query.toLowerCase().includes('select')
      )) {
        return {
          success: true,
          message: 'Stacked query injection! You could execute multiple SQL statements.',
          data: { stackedQuery: true },
          query: displayQuery
        };
      }
      break;
    }
    
    case 8: {
      // Level 8: Second-order injection (store and retrieve)
      // Input gets stored then used later unsafely
      if (query.includes("'") && (query.includes("admin") || query.includes("1=1"))) {
        return {
          success: true,
          message: 'Second-order injection! Your payload was stored and executed later.',
          data: mockDatabase[0],
          query: displayQuery
        };
      }
      break;
    }
    
    case 9: {
      // Level 9: Error-based injection
      if (query.toLowerCase().includes('extractvalue') || 
          query.toLowerCase().includes('updatexml') ||
          query.toLowerCase().includes('convert(') ||
          query.toLowerCase().includes('cast(')) {
        return {
          success: true,
          message: 'Error-based injection! Database errors revealed information.',
          data: { errorLeaked: 'Database: MySQL 8.0, Table: users' },
          query: displayQuery
        };
      }
      break;
    }
    
    case 10: {
      // Level 10: WAF bypass with encoding
      // Must use hex encoding or unicode
      if (query.includes('0x') || query.includes('\\x') || 
          query.includes('%27') || query.includes('&#')) {
        return {
          success: true,
          message: '🏆 WAF bypassed! You used encoding to evade detection.',
          data: mockDatabase,
          query: displayQuery
        };
      }
      break;
    }
  }
  
  // Normal login check
  const usernameMatch = query.match(/username='([^']+)'/);
  const passwordMatch = query.match(/password='([^']+)'/);
  
  if (usernameMatch && passwordMatch) {
    const user = mockDatabase.find(
      u => u.username === usernameMatch[1] && u.password === passwordMatch[1]
    );
    if (user) {
      return {
        success: true,
        message: `Welcome, ${user.username}!`,
        data: user,
        query: displayQuery
      };
    }
  }
  
  return {
    success: false,
    message: 'Invalid credentials. Try SQL injection!',
    query: displayQuery
  };
}

const levels: Level[] = [
  {
    id: 1,
    title: 'Level 1: No Protection',
    description: 'This login form has no SQL injection protection. Try the classic bypass!',
    hint: "Try: ' OR '1'='1' -- in the username field",
    type: 'login',
    validateInput: (username, password) => {
      const query = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`;
      return simulateSQLQuery(query, 1);
    },
  },
  {
    id: 2,
    title: 'Level 2: Comment Injection',
    description: 'The form now checks for OR. Use SQL comments to bypass!',
    hint: "Try: admin'-- in username (comments out password check)",
    type: 'login',
    validateInput: (username, password) => {
      // Filter OR keyword
      const filteredUser = username.replace(/\bOR\b/gi, '');
      const query = `SELECT * FROM users WHERE username='${filteredUser}' AND password='${password}'`;
      return simulateSQLQuery(query, 2);
    },
  },
  {
    id: 3,
    title: 'Level 3: UNION Attack',
    description: 'Comments are now filtered. Try extracting data with UNION!',
    hint: "Try: ' UNION SELECT * FROM users-- in username",
    type: 'login',
    validateInput: (username, password) => {
      // Filter comments but not UNION
      let filteredUser = username.replace(/--/g, '').replace(/#/g, '');
      const query = `SELECT * FROM users WHERE username='${filteredUser}' AND password='${password}'`;
      return simulateSQLQuery(query, 3);
    },
  },
  {
    id: 4,
    title: 'Level 4: Case Sensitivity Bypass',
    description: 'UNION is blocked but the filter is case-sensitive!',
    hint: "Try: ' or '1'='1 (lowercase) or use || operator",
    type: 'login',
    validateInput: (username, password) => {
      // Case-sensitive filter (wrong!)
      let filteredUser = username.replace(/UNION/g, '').replace(/OR/g, '');
      const query = `SELECT * FROM users WHERE username='${filteredUser}' AND password='${password}'`;
      return simulateSQLQuery(query, 4);
    },
  },
  {
    id: 5,
    title: 'Level 5: Advanced Filter Bypass',
    description: 'More keywords are blocked. Try inline comments or alternate syntax!',
    hint: "Try: admin'/**/OR/**/1=1-- or use || instead of OR",
    type: 'login',
    validateInput: (username, password) => {
      // Block common keywords
      let filteredUser = username
        .replace(/\bOR\b/gi, '')
        .replace(/\bUNION\b/gi, '')
        .replace(/--/g, '')
        .replace(/#/g, '');
      const query = `SELECT * FROM users WHERE username='${filteredUser}' AND password='${password}'`;
      return simulateSQLQuery(query, 5);
    },
  },
  {
    id: 6,
    title: 'Level 6: Time-Based Blind Injection',
    description: 'No visible output! Use time delays to extract information.',
    hint: "Try: ' OR SLEEP(5)-- or ' OR pg_sleep(5)--",
    type: 'login',
    validateInput: (username, password) => {
      const query = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`;
      return simulateSQLQuery(query, 6);
    },
  },
  {
    id: 7,
    title: 'Level 7: Stacked Queries',
    description: 'Try executing multiple SQL statements!',
    hint: "Try: '; DROP TABLE users;-- or '; SELECT * FROM users;--",
    type: 'login',
    validateInput: (username, password) => {
      const query = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`;
      return simulateSQLQuery(query, 7);
    },
  },
  {
    id: 8,
    title: 'Level 8: Second-Order Injection',
    description: 'Your input is stored and used later. Craft a payload that activates on retrieval!',
    hint: "Try registering with username: admin'-- then logging in",
    type: 'login',
    validateInput: (username, password) => {
      // Simulates stored procedure vulnerability
      const query = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`;
      return simulateSQLQuery(query, 8);
    },
  },
  {
    id: 9,
    title: 'Level 9: Error-Based Injection',
    description: 'Use database errors to extract information!',
    hint: "Try: ' AND EXTRACTVALUE(1,CONCAT(0x7e,version()))-- or CONVERT(int,@@version)--",
    type: 'login',
    validateInput: (username, password) => {
      const query = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`;
      return simulateSQLQuery(query, 9);
    },
  },
  {
    id: 10,
    title: 'Level 10: WAF Bypass',
    description: 'A Web Application Firewall blocks most attacks. Use encoding to bypass!',
    hint: "Try hex encoding: ' OR 0x313d31-- or URL encoding: %27%20OR%20%271%27=%271",
    type: 'login',
    validateInput: (username, password) => {
      // WAF simulation - block common patterns
      const blocked = /('.*OR.*'|UNION|SELECT|DROP|INSERT|UPDATE|DELETE|--|#|\/\*)/i;
      if (blocked.test(username) || blocked.test(password)) {
        // But hex/url encoding bypasses!
        if (username.includes('0x') || username.includes('%27') || username.includes('&#')) {
          const query = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`;
          return simulateSQLQuery(query, 10);
        }
        return {
          success: false,
          message: '🛡️ WAF Blocked: Suspicious input detected!',
          query: 'BLOCKED BY WAF'
        };
      }
      const query = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`;
      return simulateSQLQuery(query, 10);
    },
  },
];

// SQL Alert Modal Component
function SQLAlertModal({ 
  message,
  data,
  query,
  onClose 
}: { 
  message: string;
  data?: any;
  query: string;
  onClose: () => void;
}) {
  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-[90%] shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Database className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">SQL Injection Success!</h3>
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">✓ Attack successful</p>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{message}</p>
        </div>
        
        <div className="p-3 rounded-lg bg-gray-900 dark:bg-black mb-4 border border-gray-700 overflow-x-auto">
          <p className="text-xs text-gray-400 mb-1">Executed Query:</p>
          <code className="text-green-400 text-sm font-mono break-all">{query}</code>
        </div>
        
        {data && (
          <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-900 mb-4 border border-gray-200 dark:border-gray-700 max-h-40 overflow-y-auto">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Extracted Data:</p>
            <pre className="text-xs text-gray-700 dark:text-gray-300 font-mono">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          In a real attack, this could expose sensitive data, bypass authentication, or even delete databases.
        </p>
        <button
          onClick={onClose}
          className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}

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
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/playground"
              className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Playground
            </Link>
            
            {/* Level Progress */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                {levels.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => goToLevel(l.id)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                      completedLevels.includes(l.id)
                        ? 'bg-green-500 text-white'
                        : l.id === currentLevel
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {completedLevels.includes(l.id) ? <CheckCircle2 className="w-3.5 h-3.5" /> : l.id}
                  </button>
                ))}
              </div>
              {completedLevels.length > 0 && (
                <button
                  onClick={resetAllProgress}
                  className="text-xs text-gray-500 hover:text-red-500 transition-colors"
                  title="Reset all progress"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Challenge Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Terminal className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SQL Injection Challenge</h1>
              <p className="text-gray-600 dark:text-gray-400">Database Exploitation</p>
            </div>
          </div>
        </div>

        {/* Current Level Info */}
        <div className="mb-6 p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{level.title}</h2>
                {completedLevels.includes(currentLevel) && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                    Completed
                  </span>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400">{level.description}</p>
            </div>
            <button
              onClick={() => setShowHint(!showHint)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                showHint 
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              Hint
            </button>
          </div>
          
          {showHint && (
            <div className="mt-4 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 font-mono">
                💡 <strong>Hint:</strong> {level.hint}
              </p>
            </div>
          )}
        </div>

        {/* Success Modal */}
        {showSuccess && (
          <div className="mb-6 p-6 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 animate-in slide-in-from-top-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0">
                <Trophy className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-1">
                  🎉 SQL Injection Successful!
                </h3>
                <p className="text-green-700 dark:text-green-300 text-sm mb-4">
                  You've successfully exploited the SQL vulnerability in Level {currentLevel}!
                </p>
                
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
                      🏆 Congratulations! You've completed all SQL Injection challenges!
                    </p>
                  </div>
                )}
              </div>
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
                SELECT * FROM users WHERE username='{username || '...'}' AND password='{password || '...'}'
              </code>
            </div>
          </div>

          {/* Attempts History */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
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

            <div className="space-y-3 max-h-60 overflow-y-auto">
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
        </div>

        {/* Security Tips */}
        <div className="mt-8 p-6 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
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
