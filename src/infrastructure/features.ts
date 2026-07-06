export type LicenseType = 'products' | 'services' | 'full'

const license = (process.env.APP_LICENSE_TYPE || 'full') as LicenseType

export const features = {
  products: license === 'products' || license === 'full',
  services: license === 'services' || license === 'full',
} as const
