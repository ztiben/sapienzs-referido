import type { SelectField } from 'payload'

import { DEFAULT_WORK_DAYS } from '@/modules/bookings/constants/staff.constants'

export const weekDaysSelectField = (overrides?: Partial<SelectField>): SelectField =>
  ({
    name: 'workDays',
    label: {
      en: 'Work days',
      es: 'Días de trabajo',
    },
    type: 'select',
    hasMany: true,
    defaultValue: DEFAULT_WORK_DAYS,
    options: [
      { label: { en: 'Monday', es: 'Lunes' }, value: 'monday' },
      { label: { en: 'Tuesday', es: 'Martes' }, value: 'tuesday' },
      { label: { en: 'Wednesday', es: 'Miércoles' }, value: 'wednesday' },
      { label: { en: 'Thursday', es: 'Jueves' }, value: 'thursday' },
      { label: { en: 'Friday', es: 'Viernes' }, value: 'friday' },
      { label: { en: 'Saturday', es: 'Sábado' }, value: 'saturday' },
      { label: { en: 'Sunday', es: 'Domingo' }, value: 'sunday' },
    ],
    ...overrides,
  }) as SelectField
