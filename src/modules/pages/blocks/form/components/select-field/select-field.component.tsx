import type { SelectField } from '@payloadcms/plugin-form-builder/types'
import type { Control, FieldErrorsImpl, FieldValues } from 'react-hook-form'

import { Label } from '@/shared/components/ui/label'
import {
  Select as SelectComponent,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import React from 'react'
import { Controller } from 'react-hook-form'

import { FormError } from '@/shared/components/form-error/form-error.component'
import { FormItem } from '@/shared/components/form-item/form-item.component'
import { capitaliseFirstLetter } from '@/shared/utils/capitalise-first-letter.util'
import { Width } from '../width/width.component'

export const Select: React.FC<
  SelectField & {
    control: Control<FieldValues>
    errors: Partial<
      FieldErrorsImpl<{
        [x: string]: unknown
      }>
    >
  }
> = ({ name, control, errors, label, options, required, width }) => {
  return (
    <Width width={width}>
      <FormItem>
        <Label htmlFor={name}>{label}</Label>
        <Controller
          control={control}
          defaultValue=""
          name={name}
          render={({ field: { onChange, value } }) => {
            const controlledValue = options.find((t) => t.value === value)

            return (
              <SelectComponent
                onValueChange={(val) => onChange(val)}
                value={controlledValue?.value}
              >
                <SelectTrigger className="w-full" id={name}>
                  <SelectValue placeholder={label} />
                </SelectTrigger>
                <SelectContent>
                  {options.map(({ label, value }) => {
                    return (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </SelectComponent>
            )
          }}
          rules={{
            required: required ? `${capitaliseFirstLetter(label || name)} is required.` : undefined,
          }}
        />
        {errors?.[name]?.message && typeof errors?.[name]?.message === 'string' && (
          <FormError message={errors?.[name]?.message} />
        )}
      </FormItem>
    </Width>
  )
}
