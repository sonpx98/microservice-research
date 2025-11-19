import { NextResponse } from 'next/server';

export async function GET() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const envCheck = {
    NODE_ENV: process.env.NODE_ENV,
    hasClientId: !!process.env.KEYSTATIC_GITHUB_CLIENT_ID,
    hasClientSecret: !!process.env.KEYSTATIC_GITHUB_CLIENT_SECRET,
    hasSecret: !!process.env.KEYSTATIC_SECRET,
    clientIdLength: process.env.KEYSTATIC_GITHUB_CLIENT_ID?.length || 0,
    repo: 'sonpx98/microservice-research'
  };

  const storageType = isProduction ? 'github' : 'local';
  const allConfigured = envCheck.hasClientId && envCheck.hasClientSecret && envCheck.hasSecret;

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    storage: storageType,
    github: {
      configured: allConfigured,
      ready: isProduction && allConfigured
    },
    env: envCheck
  });
}