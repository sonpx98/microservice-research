/**
 * Theme Script Component
 * 
 * Injects a blocking script to set theme class BEFORE any content is painted.
 * Uses CSS class to control visibility until theme is ready.
 */

const themeScript = `
(function() {
  function setTheme() {
    try {
      const storageKey = 'theme';
      const stored = localStorage.getItem(storageKey);
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Determine theme: stored > system > default (light)
      let theme = stored;
      if (!theme || theme === 'system') {
        theme = systemDark ? 'dark' : 'light';
      }
      
      // Apply theme class to html element
      const html = document.documentElement;
      html.classList.remove('light', 'dark');
      html.classList.add(theme);
      html.style.colorScheme = theme;
    } catch (e) {
      // Silent fail
    }
  }
  
  // Run immediately
  setTheme();
  
  // Also run on page show (for bfcache)
  window.addEventListener('pageshow', setTheme);
})();
`;

// CSS that hides content until theme is applied (injected inline)
const themeCss = `
  html:not(.light):not(.dark) { visibility: hidden; }
  html.light, html.dark { visibility: visible; }
`;

export function ThemeScript() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: themeCss }} />
      <script
        dangerouslySetInnerHTML={{ __html: themeScript }}
        suppressHydrationWarning
      />
    </>
  );
}
