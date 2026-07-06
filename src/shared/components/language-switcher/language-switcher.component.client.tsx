'use client'

import { Button } from '@/shared/components/ui/button'
import React from 'react'

import { useLanguageSwitcher } from './use-language-switcher'

const localeLabels: Record<string, string> = {
  es: 'ES',
  en: 'EN',
}

export const LanguageSwitcher: React.FC = () => {
  const { nextLocale, isPending, switchLocale } = useLanguageSwitcher()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={switchLocale}
      disabled={isPending}
      className="text-xs font-medium"
    >
      {localeLabels[nextLocale]}
    </Button>
  )
}
