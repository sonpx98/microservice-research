import { NextResponse } from 'next/server';

export async function GET() {
  const hasAuth = !!(
    process.env.KEYSTATIC_GITHUB_CLIENT_ID && 
    process.env.KEYSTATIC_GITHUB_CLIENT_SECRET && 
    process.env.KEYSTATIC_SECRET
  );

  const testPaths = [
    './content/posts/en/',
    './content/posts/vi/',
    'packages/keystatic-admin/content/posts/en/',
    'packages/keystatic-admin/content/posts/vi/'
  ];

  const pathsToTest = [
    'packages/keystatic-admin/content/posts/en',
    'content/posts/en',
    'packages/keystatic-admin/content/posts/vi',
    'content/posts/vi'
  ];

  let githubTests: Record<string, any> = {};
  
  for (const testPath of pathsToTest) {
    try {
      const response = await fetch(
        `https://api.github.com/repos/sonpx98/microservice-research/contents/${testPath}`
      );
      const data = response.ok ? await response.json() : null;
      githubTests[testPath] = {
        status: response.status,
        ok: response.ok,
        fileCount: Array.isArray(data) ? data.length : 0,
        files: Array.isArray(data) ? data.map((f: any) => f.name).slice(0, 3) : null,
        error: !response.ok ? `HTTP ${response.status}` : null
      };
    } catch (error) {
      githubTests[testPath] = { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  let keystatic_internal_test = null;
  try {
    const headers: Record<string, string> = {};
    
    if (process.env.KEYSTATIC_GITHUB_CLIENT_ID && process.env.KEYSTATIC_GITHUB_CLIENT_SECRET) {
      const authResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.KEYSTATIC_GITHUB_CLIENT_ID}:${process.env.KEYSTATIC_GITHUB_CLIENT_SECRET}`).toString('base64')}`
        }
      });
      
      keystatic_internal_test = {
        auth_test: authResponse.status,
        can_authenticate: authResponse.ok
      };
    }
  } catch (error) {
    keystatic_internal_test = { 
      error: error instanceof Error ? error.message : 'Auth test failed' 
    };
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    keystatic: {
      hasAuth,
      clientIdPrefix: process.env.KEYSTATIC_GITHUB_CLIENT_ID?.substring(0, 4) + '...',
      hasSecret: !!process.env.KEYSTATIC_SECRET,
      internal_connection: keystatic_internal_test
    },
    github_path_tests: githubTests,
    paths: {
      configured: [
        'packages/keystatic-admin/content/posts/en/*',
        'packages/keystatic-admin/content/posts/vi/*'
      ],
      note: 'Testing which paths work with GitHub API'
    },
    expectedWorkingDir: '/vercel/path0/packages/keystatic-admin (on Vercel)',
    actualResolvedPaths: testPaths.map(path => ({
      input: path,
      resolved: path.startsWith('./') ? 'content/posts/...' : path
    }))
  });
}