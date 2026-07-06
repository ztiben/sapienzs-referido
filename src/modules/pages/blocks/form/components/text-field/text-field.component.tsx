import type { TextField } from '@payloadcms/plugin-form-builder/types'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import React from 'react'

import { FormError } from '@/shared/components/form-error/form-error.component'
import { FormItem } from '@/shared/components/form-item/form-item.component'
import { capitaliseFirstLetter } from '@/shared/utils/capitalise-first-letter.util'
import { Width } from '../width/width.component'

export const Text: React.FC<
  TextField & {
    errors: Partial<
      FieldErrorsImpl<{
        [x: string]: unknown
      }>
    >
    register: UseFormRegister<FieldValues>
  }
> = ({ name, defaultValue, errors, label, register, required: requiredFromProps, width }) => {
  return (
    <Width width={width}>
      <FormItem>
        <Label htmlFor={name}>{label}</Label>
        <Input
          defaultValue={defaultValue}
          id={name}
          type="text"
          {...register(name, {
            required: requiredFromProps
              ? `${capitaliseFirstLetter(label || name)} is required.`
              : undefined,
          })}
        />

        {errors?.[name]?.message && typeof errors?.[name]?.message === 'string' && (
          <FormError message={errors?.[name]?.message} />
        )}
      </FormItem>
    </Width>
  )
}
