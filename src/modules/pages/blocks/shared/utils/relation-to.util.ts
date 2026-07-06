import { features } from '@/infrastructure/features'

export const relationTo: ('products' | 'services')[] = [
  ...(features.products ? (['products'] as const) : []),
  ...(features.services ? (['services'] as const) : []),
]
