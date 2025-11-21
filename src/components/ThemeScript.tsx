// components/ThemeScript.tsx
/**
 * =============================================================================
 * Theme Initialization Script
 * =============================================================================
 * This script runs BEFORE React hydrates to prevent flash of wrong theme.
 * Place this in the <head> of your root layout.
 */

export function ThemeScript() {
  const themeScript = `
    (function() {
      try {
        const storageKey = 'moviesnow-theme';
        const theme = localStorage.getItem(storageKey) || 'system';

        let resolvedTheme = 'dark';

        if (theme === 'system') {
          resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
        } else {
          resolvedTheme = theme;
        }

        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(resolvedTheme);

        // Set a data attribute for CSS to use if needed
        document.documentElement.setAttribute('data-theme', resolvedTheme);
      } catch (e) {
        // If anything fails, default to dark theme
        document.documentElement.classList.add('dark');
      }
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: themeScript }}
      // This script must be blocking to prevent flash
      suppressHydrationWarning
    />
  );
}
