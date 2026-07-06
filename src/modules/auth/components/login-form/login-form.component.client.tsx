'use client'

import { FormError } from '@/shared/components/form-error/form-error.component'
import { FormItem } from '@/shared/components/form-item/form-item.component'
import { Message } from '@/shared/components/message/message.component'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import React from 'react'

import { useLoginForm } from './use-login-form'

export const LoginForm: React.FC = () => {
  const t = useTranslations('auth')
  const { onSubmit, register, errors, isLoading, error, allParams } = useLoginForm()

  return (
    <form onSubmit={onSubmit}>
      <Message className="classes.message" error={error} />
      <div className="flex flex-col gap-8">
        <FormItem>
          <Label htmlFor="email">{t('email')}</Label>
          <Input id="email" type="email" {...register('email', { required: t('emailRequired') })} />
          {errors.email && <FormError message={errors.email.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="password">{t('password')}</Label>
          <Input
            id="password"
            type="password"
            {...register('password', { required: t('passwordRequired') })}
          />
          {errors.password && <FormError message={errors.password.message} />}
        </FormItem>

        <div className="text-base-content/70 mb-6 prose prose-a:hover:text-base-content">
          <p>
            {t('forgotPassword')}{' '}
            <Link href={`/forgot-password${allParams}`}>{t('resetPassword')}</Link>
          </p>
        </div>
      </div>

      <div className="flex gap-4 justify-between">
        <Button asChild variant="outline" size="lg">
          <Link href={`/create-account${allParams}`} className="grow max-w-[50%]">
            {t('createAnAccount')}
          </Link>
        </Button>
        <Button className="grow" disabled={isLoading} size="lg" type="submit" variant="default">
          {isLoading ? t('processing') : t('continue')}
        </Button>
      </div>
    </form>
  )
}
