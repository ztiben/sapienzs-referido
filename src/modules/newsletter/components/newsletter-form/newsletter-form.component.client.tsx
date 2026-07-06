'use client'

import { useTranslations } from 'next-intl'
import React from 'react'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/utils/cn.util'

import { useNewsletterForm } from './use-newsletter-form'

type Props = {
  source?: string
  className?: string
}

export const NewsletterForm: React.FC<Props> = ({ source, className }) => {
  const { onSubmit, isMutating } = useNewsletterForm(source)
  const t = useTranslations('newsletter')

  return (
    <form className={cn('flex w-full max-w-md gap-2', className)} onSubmit={onSubmit}>
      <Input
        autoComplete="email"
        name="email"
        placeholder={t('placeholder')}
        required
        type="email"
      />
      <Button disabled={isMutating} type="submit">
        {t('subscribe')}
      </Button>
    </form>
  )
}
