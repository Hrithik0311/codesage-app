"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import type { ThemeProviderProps } from "next-themes/dist/types"

function ThemeEffect() {
  const { theme } = useTheme();

  React.useEffect(() => {
    // Find all potential body classes. In our case, only one.
    const bodyClass = 'liquid-glass-bg';

    // Add or remove the class based on the current theme
    if (theme === 'liquid-glass') {
      document.body.classList.add(bodyClass);
    } else {
      document.body.classList.remove(bodyClass);
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
