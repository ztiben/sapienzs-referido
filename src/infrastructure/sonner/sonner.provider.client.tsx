'use client'

import { Toaster } from 'sonner'

export const SonnerProvider = ({ children }: { children?: React.ReactNode }) => {
  return (
    <>
      {children}

      <Toaster
        richColors
        position="bottom-left"
        style={
          {
            '--normal-bg': 'var(--base-100)',
            '--normal-text': 'var(--base-content)',
            '--normal-border': 'var(--base-300)',
            '--success-bg': 'var(--success)',
            '--success-text': 'var(--success-content)',
            '--success-border': 'var(--success)',
            '--error-bg': 'var(--error)',
            '--error-text': 'var(--error-content)',
            '--error-border': 'var(--error)',
            '--warning-bg': 'var(--warning)',
            '--warning-text': 'var(--warning-content)',
            '--warning-border': 'var(--warning)',
            '--info-bg': 'var(--info)',
            '--info-text': 'var(--info-content)',
            '--info-border': 'var(--info)',
          } as React.CSSProperties
        }
      />
    </>
  )
}
