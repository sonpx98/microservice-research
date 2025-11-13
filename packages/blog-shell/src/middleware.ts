import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'vi'],
  defaultLocale: 'en',
  localePrefix: 'always'
});

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
