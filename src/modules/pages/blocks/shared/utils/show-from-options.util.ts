import { features } from '@/infrastructure/features'
import type { OptionObject } from 'payload'

export const showFromOptions: OptionObject[] = [
  ...(features.products ? [{ label: { en: 'Products', es: 'Productos' }, value: 'products' }] : []),
  ...(features.services ? [{ label: { en: 'Services', es: 'Servicios' }, value: 'services' }] : []),
  ...(features.products && features.services
    ? [{ label: { en: 'All', es: 'Todos' }, value: 'all' }]
    : []),
]
