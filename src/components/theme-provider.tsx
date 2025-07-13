
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import type { ThemeProviderProps } from "next-themes/dist/types"

function ThemeEffect() {
  const { theme } = useTheme();

  React.useEffect(() => {
    let backgroundStart: string, backgroundEnd: string;
    
    try {
        const customThemeSettings = localStorage.getItem('custom-theme-settings');
        if (customThemeSettings) {
            const settings = JSON.parse(customThemeSettings);
            backgroundStart = settings.backgroundStart || '#0f0c29';
            backgroundEnd = settings.backgroundEnd || '#24243e';
        } else {
            backgroundStart = '#0f0c29';
            backgroundEnd = '#24243e';
        }
    } catch (e) {
        backgroundStart = '#0f0c29';
        backgroundEnd = '#24243e';
        console.warn("Could not parse custom theme settings from localStorage.", e);
    }

    if (theme === 'liquid-glass') {
      document.body.style.background = `linear-gradient(135deg, ${backgroundStart}, ${backgroundEnd})`;
    } else {
      // Clear the background style when switching to any other theme
      document.body.style.background = '';
    }
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
