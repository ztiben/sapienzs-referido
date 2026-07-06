import type { CheckboxField } from '@payloadcms/plugin-form-builder/types'
import type {
  FieldErrorsImpl,
  FieldValues,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form'

import { FormError } from '@/shared/components/form-error/form-error.component'
import { Checkbox as CheckboxUi } from '@/shared/components/ui/checkbox'
import { Label } from '@/shared/components/ui/label'
import React from 'react'

import { Width } from '../width/width.component'
import { useCheckboxField } from './use-checkbox-field'

export const Checkbox: React.FC<
  CheckboxField & {
    errors: Partial<
      FieldErrorsImpl<{
        [x: string]: unknown
      }>
    >
    getValues: UseFormGetValues<FieldValues>
    register: UseFormRegister<FieldValues>
    setValue: UseFormSetValue<FieldValues>
  }
> = ({ name, defaultValue, errors, label, register, required: requiredFromProps, width }) => {
  const { props, onCheckedChange } = useCheckboxField({
    name,
    label,
    required: requiredFromProps,
    register,
  })

  return (
    <Width width={width}>
      <div className="flex items-center gap-2">
        <CheckboxUi
          defaultChecked={defaultValue}
          id={name}
          {...props}
          onCheckedChange={(checked) => onCheckedChange(checked as boolean)}
        />
        <Label htmlFor={name}>{label}</Label>
      </div>
      {errors?.[name]?.message && typeof errors?.[name]?.message === 'string' && (
        <FormError message={errors?.[name]?.message} />
      )}
    </Width>
  )
}
