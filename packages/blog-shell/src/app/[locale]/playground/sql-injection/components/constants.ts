import { SQLLevel, SQLLevelExplanation } from './types';
import { simulateSQLQuery } from './services';

export const sqlLevelExplanations: Record<number, SQLLevelExplanation> = {
  1: {
    attackName: 'Classic OR-based Authentication Bypass',
    howItWorks: 'The attacker enters " OR \'1\'=\'1" as the username. This changes the SQL WHERE clause from checking username and password to a condition that\'s always true (1=1).',
    whyItSucceeds: 'No input validation or parameterized queries. User input is directly concatenated into the SQL string. The filter can\'t distinguish between intended SQL and injected SQL.',
    realWorldImpact: 'Complete authentication bypass. The attacker gains access without knowing any password. This is the most common and devastating XSS vulnerability.',
  },
  2: {
    attackName: 'SQL Comment-Based Authentication Bypass',
    howItWorks: 'The attacker uses "admin\'--" which closes the string and comments out the password check using --. The query becomes: SELECT * FROM users WHERE username=\'admin\' -- AND password=...',
    whyItSucceeds: 'OR is filtered but the filter doesn\'t block SQL comments. Comments (-- and #) are valid SQL syntax that can remove parts of the query completely.',
    realWorldImpact: 'Attackers can bypass authentication by using admin credentials without needing the password. Comments are a fundamental SQL feature that can\'t be safely blocked.',
  },
  3: {
    attackName: 'UNION-Based Data Extraction',
    howItWorks: 'The attacker uses UNION SELECT to combine results from multiple tables. This extracts all data from the users table regardless of the WHERE clause.',
    whyItSucceeds: 'Comments are filtered but UNION isn\'t. UNION is valid SQL syntax that allows combining query results. Attackers can use it to extract additional data.',
    realWorldImpact: 'Attackers can access all database records, not just a single user. This is used for mass data theft, including credit cards, passwords, and personal information.',
  },
  4: {
    attackName: 'Case-Sensitivity Bypass',
    howItWorks: 'The filter blocks "UNION" in uppercase, but the attacker uses "union" in lowercase. SQL is case-insensitive for keywords, so "union" works identically to "UNION".',
    whyItSucceeds: 'The filter uses case-sensitive string replacement without the case-insensitive flag. Attackers simply change the case of SQL keywords to bypass blacklists.',
    realWorldImpact: 'Shows why blacklisting is unreliable. Case variations, alternate syntax (||, mysql_comment), and encoded versions can bypass simple filters.',
  },
  5: {
    attackName: 'Inline Comment-Based Filter Bypass',
    howItWorks: 'Using "/**/OR/*/*/" - the /**/ is an inline comment in SQL that allows inserting spaces. This bypasses filters looking for exact matches like "OR".',
    whyItSucceeds: 'Filters block OR but not the techniques to hide it. SQL has multiple comment styles (--,#,/**/) that can be chained to bypass pattern matching.',
    realWorldImpact: 'Demonstrates that blocking keywords is nearly impossible. Attackers use encoding, comments, and alternate syntax to hide malicious SQL from filters.',
  },
  6: {
    attackName: 'Time-Based Blind SQL Injection',
    howItWorks: 'When output is hidden, attackers use SLEEP(5) to make the database pause. If it delays, they know the condition was true. By testing individual characters, they extract data slowly.',
    whyItSucceeds: 'Without visible error messages or output, attackers extract data through response timing. This works even when the application gives no feedback about the query results.',
    realWorldImpact: 'Attackers can extract sensitive data even from applications that don\'t display database errors. It\'s slower but very reliable and hard to detect.',
  },
  7: {
    attackName: 'Stacked Queries / Multi-Statement Execution',
    howItWorks: 'Using semicolons to execute multiple SQL statements: "admin\';DROP TABLE users;--". The database executes the DROP TABLE command after the SELECT.',
    whyItSucceeds: 'Some databases allow stacked queries where multiple statements are executed. This enables attackers not just to read but to modify or delete data.',
    realWorldImpact: 'This is one of the most dangerous attacks - it allows data destruction, modification, privilege escalation, and complete database compromise.',
  },
  8: {
    attackName: 'Second-Order / Stored SQL Injection',
    howItWorks: 'The attacker stores malicious SQL in the database, then it executes later when the application retrieves and uses the stored data in another query.',
    whyItSucceeds: 'Input validation happens during storage, not retrieval. If the retrieved data is concatenated into a new query, the injection payload activates even if the first query was safe.',
    realWorldImpact: 'Very dangerous because the attack happens in a different code path. Developers may trust data from their own database, missing the vulnerability.',
  },
  9: {
    attackName: 'Error-Based SQL Injection',
    howItWorks: 'Using functions like EXTRACTVALUE or CAST that generate database errors containing the extracted data. The attacker reads sensitive info from error messages.',
    whyItSucceeds: 'Developers often expose database error messages in responses. Attackers craft queries that generate errors containing the information they want to extract.',
    realWorldImpact: 'Allows extracting database version, table structure, and data directly through error messages. This is faster than blind injection and provides detailed information.',
  },
  10: {
    attackName: 'WAF Bypass Using Encoding',
    howItWorks: 'Using hex encoding (0x...) or URL encoding (%27 for quote) to represent SQL keywords. The WAF blocks plain text, but encoded versions bypass it.',
    whyItSucceeds: 'Web Application Firewalls often use pattern matching on visible text. Encoding changes the pattern while keeping the same SQL meaning - the database decodes it.',
    realWorldImpact: 'Shows that encoding-based bypasses work against both application-level and WAF-level protections. Multiple layers of defense require defense in depth.',
  },
};

export const levels: SQLLevel[] = [
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