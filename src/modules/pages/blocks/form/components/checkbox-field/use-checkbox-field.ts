import type { FieldValues, UseFormRegister } from 'react-hook-form'

import { capitaliseFirstLetter } from '@/shared/utils/capitalise-first-letter.util'
import { useFormContext } from 'react-hook-form'

export const useCheckboxField = ({
  name,
  label,
  required,
  register,
}: {
  name: string
  label?: string
  required?: boolean
  register: UseFormRegister<FieldValues>
}) => {
  const props = register(name, {
    required: required ? `${capitaliseFirstLetter(label || name)} is required.` : undefined,
  })
  const { setValue } = useFormContext()

  const onCheckedChange = (checked: boolean) => {
    setValue(props.name, checked)
  }

  return { props, onCheckedChange }
}
