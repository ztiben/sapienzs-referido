'use client'

import { FormError } from '@/shared/components/form-error/form-error.component'
import { FormItem } from '@/shared/components/form-item/form-item.component'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { useTranslations } from 'next-intl'
import React, { Fragment } from 'react'

import { useFindOrderForm } from './use-find-order-form'

type Props = {
  initialEmail?: string
}

export const FindOrderForm: React.FC<Props> = ({ initialEmail }) => {
  const t = useTranslations('orders')
  const { onSubmit, register, errors } = useFindOrderForm(initialEmail)

  return (
    <Fragment>
      <h1 className="text-xl mb-4">{t('findOrder')}</h1>
      <div className="prose mb-8">
        <p>{t('enterDetails')}</p>
      </div>
      <form className="max-w-lg flex flex-col gap-8" onSubmit={onSubmit}>
        <FormItem>
          <Label htmlFor="email" className="mb-2">
            {t('emailAddress')}
          </Label>
          <Input id="email" {...register('email', { required: t('emailRequired') })} type="email" />
          {errors.email && <FormError message={errors.email.message} />}
        </FormItem>
        <FormItem>
          <Label htmlFor="orderID" className="mb-2">
            {t('orderId')}
          </Label>
          <Input
            id="orderID"
            {...register('orderID', {
              required: t('orderIdRequired'),
            })}
            type="text"
          />
          {errors.orderID && <FormError message={errors.orderID.message} />}
        </FormItem>
        <Button type="submit" className="self-start" variant="default">
          {t('findOrder')}
        </Button>
      </form>
    </Fragment>
  )
}
