'use client'

import { FormError } from '@/shared/components/form-error/form-error.component'
import { FormItem } from '@/shared/components/form-item/form-item.component'
import { Message } from '@/shared/components/message/message.component'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import React, { Fragment } from 'react'

import { useForgotPasswordForm } from './use-forgot-password-form'

export const ForgotPasswordForm: React.FC = () => {
  const t = useTranslations('forgotPassword')
  const { onSubmit, register, errors, error, success } = useForgotPasswordForm()

  return (
    <Fragment>
      {!success && (
        <React.Fragment>
          <h1 className="text-xl mb-4">{t('title')}</h1>
          <div className="prose mb-8">
            <p>
              {t('description')}{' '}
              <Link href="/admin/collections/users">{t('adminLink')}</Link>.
            </p>
          </div>
          <form className="max-w-lg" onSubmit={onSubmit}>
            <Message className="mb-8" error={error} />

            <FormItem className="mb-8">
              <Label htmlFor="email" className="mb-2">
                {t('emailLabel')}
              </Label>
              <Input
                id="email"
                {...register('email', { required: t('emailRequired') })}
                type="email"
              />
              {errors.email && <FormError message={errors.email.message} />}
            </FormItem>

            <Button type="submit" variant="default">
              {t('submitButton')}
            </Button>
          </form>
        </React.Fragment>
      )}
      {success && (
        <React.Fragment>
          <h1 className="text-xl mb-4">{t('successTitle')}</h1>
          <div className="prose">
            <p>{t('successMessage')}</p>
          </div>
        </React.Fragment>
      )}
    </Fragment>
  )
}
