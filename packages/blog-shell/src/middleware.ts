import createMiddleware from 'next-intl/middleware';

import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['en', 'vi'],
  defaultLocale: 'en',
  localePrefix: 'always'
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Feature Flag Logic
  // Default is enabled (true). Only disabled if explicitly set to 'false'.
  const isEnglishLearningDisabled = process.env.NEXT_PUBLIC_FEATURE_ENGLISH_LEARNING === 'false';
  const isCoBrowsingDisabled = process.env.NEXT_PUBLIC_FEATURE_CO_BROWSING === 'false';
  const isAlgoVerseDisabled = process.env.NEXT_PUBLIC_FEATURE_ALGO_VERSE === 'false';
  const isCvGeneratorDisabled = process.env.NEXT_PUBLIC_FEATURE_CV_GENERATOR === 'false';
  const isKnowledgeGraphDisabled = process.env.NEXT_PUBLIC_FEATURE_KNOWLEDGE_GRAPH === 'false';

  // Check for English Learning
  if (isEnglishLearningDisabled && pathname.includes('/english-learning')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Check for Co-browsing
  if (isCoBrowsingDisabled && pathname.includes('/tools/co-browsing')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Check for Algo Verse
  if (isAlgoVerseDisabled && pathname.includes('/algo-verse')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Check for CV Generator
  if (isCvGeneratorDisabled && pathname.includes('/tools/cv-generator')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Check for Knowledge Graph
  if (isKnowledgeGraphDisabled && pathname.includes('/knowledge-graph')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - /api routes
    // - /keystatic (Keystatic CMS admin UI)
    // - /_next (Next.js internals)
    // - static files
    '/((?!api|keystatic|_next|_vercel|.*\\..*).*)',
  ]
};
