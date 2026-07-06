'use client'

import React, { createContext, useContext } from 'react'

import { canUseDOM } from '@/shared/utils/can-use-dom.util'

type Theme = string

interface ThemeContextType {
  theme?: Theme | null
}

const initialContext: ThemeContextType = {
  theme: undefined,
}

const ThemeContext = createContext(initialContext)

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const theme = canUseDOM
    ? (document.documentElement.getAttribute('data-theme') as Theme)
    : undefined

  return <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>
}

export const useTheme = (): ThemeContextType => useContext(ThemeContext)
