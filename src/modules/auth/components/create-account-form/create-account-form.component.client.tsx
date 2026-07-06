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

import { useCreateAccountForm } from './use-create-account-form'

export const CreateAccountForm: React.FC = () => {
  const t = useTranslations('auth')
  const { onSubmit, register, errors, loading, error, allParams, password } =
    useCreateAccountForm()

  return (
    <form className="max-w-lg py-4" onSubmit={onSubmit}>
      <div className="prose mb-6">
        <p>
          {t('createAccountDescription')}
          <Link href="/admin/collections/users">{t('adminLink')}</Link>.
        </p>
      </div>

      <Message error={error} />

      <div className="flex flex-col gap-8 mb-8">
        <FormItem>
          <Label htmlFor="name" className="mb-2">
            {t('name')}
          </Label>
          <Input id="name" {...register('name', { required: t('nameRequired') })} type="text" />
          {errors.name && <FormError message={errors.name.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="email" className="mb-2">
            {t('emailAddress')}
          </Label>
          <Input id="email" {...register('email', { required: t('emailRequired') })} type="email" />
          {errors.email && <FormError message={errors.email.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="password" className="mb-2">
            {t('newPassword')}
          </Label>
          <Input
            id="password"
            {...register('password', { required: t('passwordRequired') })}
            type="password"
          />
          {errors.password && <FormError message={errors.password.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="passwordConfirm" className="mb-2">
            {t('confirmPassword')}
          </Label>
          <Input
            id="passwordConfirm"
            {...register('passwordConfirm', {
              required: t('pleaseConfirmPassword'),
              validate: (value) => value === password || t('passwordsDoNotMatch'),
            })}
            type="password"
          />
          {errors.passwordConfirm && <FormError message={errors.passwordConfirm.message} />}
        </FormItem>
      </div>
      <Button disabled={loading} type="submit" variant="default">
        {loading ? t('processing') : t('createAccount')}
      </Button>

      <div className="prose mt-8">
        <p>
          {t('alreadyHaveAccount')}
          <Link href={`/login${allParams}`}>{t('login')}</Link>
        </p>
      </div>
    </form>
  )
}
