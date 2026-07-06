import type { Service } from '@/payload-types'

type Params = {
  services: Service[]
}

export const checkServicesAreInStore = ({ services }: Params): void => {
  const hasIncompatible = services.some((s) => !s.modalities?.includes('inStore'))
  if (hasIncompatible) throw new Error(undefined, { cause: 'invalid' })
}
