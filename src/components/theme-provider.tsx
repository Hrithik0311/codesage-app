
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import type { ThemeProviderProps } from "next-themes/dist/types"

function ThemeEffect() {
  const { theme } = useTheme();

  React.useEffect(() => {
    const customThemeSettings = localStorage.getItem('custom-theme-settings');
    let backgroundStart = '#0f0c29';
    let backgroundEnd = '#24243e';

    if (customThemeSettings) {
        const settings = JSON.parse(customThemeSettings);
        backgroundStart = settings.backgroundStart || backgroundStart;
        backgroundEnd = settings.backgroundEnd || backgroundEnd;
    }

    if (theme === 'liquid-glass') {
      document.body.style.background = `linear-gradient(135deg, ${backgroundStart}, ${backgroundEnd})`;
    } else {
      document.body.style.background = '';
    }

    // Cleanup function to remove style when component unmounts or theme changes
    return () => {
        document.body.style.background = '';
    };
  }, [theme]);

  return null;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <ThemeEffect />
      {children}
    </NextThemesProvider>
  )
}
