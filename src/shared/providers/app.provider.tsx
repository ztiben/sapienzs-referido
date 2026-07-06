import React from 'react'

import { SonnerProvider } from '@/infrastructure/sonner/sonner.provider.client'
import { SwrProvider } from '@/infrastructure/swr/swr.provider.client'
import { ThemeProvider } from '@/infrastructure/theme/theme.provider.client'
import { AuthProvider } from '@/shared/providers/auth.provider.client'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SonnerProvider />
        <SwrProvider>{children}</SwrProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
