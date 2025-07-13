
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import type { ThemeProviderProps } from "next-themes/dist/types"

function hexToHsl(hex: string): string {
    if (!hex) return '0 0% 0%';
    hex = hex.replace(/^#/, '');
    const bigint = parseInt(hex, 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;

    r /= 255; g /= 255; b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function ThemeEffect() {
  const { theme } = useTheme();

  React.useEffect(() => {
    const docStyle = document.documentElement.style;
    
    try {
        const customThemeSettingsJSON = localStorage.getItem('custom-theme-settings');
        if (customThemeSettingsJSON) {
            const settings = JSON.parse(customThemeSettingsJSON);
            
            if (theme === 'custom') {
                docStyle.setProperty('--custom-primary', hexToHsl(settings.primary));
                docStyle.setProperty('--custom-accent', hexToHsl(settings.accent));
                docStyle.setProperty('--custom-background', hexToHsl(settings.background));
                docStyle.setProperty('--custom-foreground', hexToHsl(settings.foreground));
                docStyle.setProperty('--custom-primary-foreground', hexToHsl(settings.primaryForeground));
            }

            if (theme === 'liquid-glass') {
                document.body.style.background = `linear-gradient(135deg, ${settings.backgroundStart}, ${settings.backgroundEnd})`;
                // Set text color for liquid glass theme
                document.body.style.color = settings.liquidForeground || '#FFFFFF';
            } else {
                document.body.style.background = '';
                document.body.style.color = '';
            }
        }
    } catch (e) {
        console.warn("Could not parse custom theme settings from localStorage.", e);
        document.body.style.background = '';
        document.body.style.color = '';
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
