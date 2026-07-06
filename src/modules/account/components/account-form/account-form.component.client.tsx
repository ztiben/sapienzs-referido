'use client'

import { FormError } from '@/shared/components/form-error/form-error.component'
import { FormItem } from '@/shared/components/form-item/form-item.component'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { useTranslations } from 'next-intl'
import React, { Fragment } from 'react'

import { useAccountForm } from './use-account-form'

export const AccountForm: React.FC = () => {
  'use no memo' // React Compiler breaks RHF's formState proxy subscription (here: isDirty) — see CLAUDE.md
  const t = useTranslations('account')
  const {
    onSubmit,
    register,
    errors,
    isLoading,
    isSubmitting,
    isDirty,
    changePassword,
    setChangePassword,
    password,
  } = useAccountForm()

  return (
    <form className="max-w-xl" onSubmit={onSubmit}>
      {!changePassword ? (
        <Fragment>
          <div className="prose mb-8">
            <p className="">
              {t('changeDetails')}
              <Button
                className="px-0 text-inherit underline hover:cursor-pointer"
                onClick={() => setChangePassword(!changePassword)}
                type="button"
                variant="link"
              >
                {t('clickHerePassword')}
              </Button>
              {t('toChangePassword')}
            </p>
          </div>

          <div className="flex flex-col gap-8 mb-8">
            <FormItem>
              <Label htmlFor="email" className="mb-2">
                {t('emailLabel')}
              </Label>
              <Input
                id="email"
                {...register('email', { required: t('provideEmail') })}
                type="email"
              />
              {errors.email && <FormError message={errors.email.message} />}
            </FormItem>

            <FormItem>
              <Label htmlFor="name" className="mb-2">
                {t('nameLabel')}
              </Label>
              <Input id="name" {...register('name', { required: t('provideName') })} type="text" />
              {errors.name && <FormError message={errors.name.message} />}
            </FormItem>
          </div>
        </Fragment>
      ) : (
        <Fragment>
          <div className="prose mb-8">
            <p>
              {t('changePasswordBelow')}
              <Button
                className="px-0 text-inherit underline hover:cursor-pointer"
                onClick={() => setChangePassword(!changePassword)}
                type="button"
                variant="link"
              >
                {t('cancel')}
              </Button>
              .
            </p>
          </div>

          <div className="flex flex-col gap-8 mb-8">
            <FormItem>
              <Label htmlFor="password" className="mb-2">
                {t('newPasswordLabel')}
              </Label>
              <Input
                id="password"
                {...register('password', { required: t('provideNewPassword') })}
                type="password"
              />
              {errors.password && <FormError message={errors.password.message} />}
            </FormItem>

            <FormItem>
              <Label htmlFor="passwordConfirm" className="mb-2">
                {t('confirmPasswordLabel')}
              </Label>
              <Input
                id="passwordConfirm"
                {...register('passwordConfirm', {
                  required: t('confirmNewPassword'),
                  validate: (value) => value === password || t('passwordsDoNotMatch'),
                })}
                type="password"
              />
              {errors.passwordConfirm && <FormError message={errors.passwordConfirm.message} />}
            </FormItem>
          </div>
        </Fragment>
      )}
      <Button disabled={isLoading || isSubmitting || !isDirty} type="submit" variant="default">
        {isLoading || isSubmitting
          ? t('processing')
          : changePassword
            ? t('changePassword')
            : t('updateAccount')}
      </Button>
    </form>
  )
}
