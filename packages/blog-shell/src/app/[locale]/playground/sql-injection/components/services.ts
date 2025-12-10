import { User } from './types';

const mockDatabase: User[] = [
  { id: 1, username: 'admin', password: 'sup3rs3cr3t!', role: 'admin', email: 'admin@example.com' },
  { id: 2, username: 'john', password: 'john123', role: 'user', email: 'john@example.com' },
  { id: 3, username: 'alice', password: 'alice456', role: 'user', email: 'alice@example.com' },
  { id: 4, username: 'bob', password: 'bobpass', role: 'moderator', email: 'bob@example.com' },
];

/**
 * Simulate SQL query execution with injection vulnerabilities
 */
export function simulateSQLQuery(
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