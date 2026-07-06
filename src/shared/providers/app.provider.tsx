import { AuthProvider } from '@/shared/providers/auth.provider.client'
import { currenciesConfig } from '@/infrastructure/currencies/currencies.config'
import { EcommerceProvider } from '@payloadcms/plugin-ecommerce/client/react'
import React from 'react'

import { ThemeProvider } from '@/infrastructure/theme/theme.provider.client'
import { mercadopagoAdapterClient } from '@/modules/checkout/payment-methods/mercadopago/mercadopago.client'
import { SonnerProvider } from '@/infrastructure/sonner/sonner.provider.client'
import { SwrProvider } from '@/infrastructure/swr/swr.provider.client'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SonnerProvider />
        <SwrProvider>
          <EcommerceProvider
            currenciesConfig={currenciesConfig}
            enableVariants={true}
            api={{
              cartsFetchQuery: {
                depth: 2,
                populate: {
                  products: {
                    slug: true,
                    title: true,
                    gallery: true,
                    inventory: true,
                    infiniteInventory: true,
                  },
                  variants: {
                    title: true,
                    inventory: true,
                    infiniteInventory: true,
                  },
                },
              },
            }}
            paymentMethods={[mercadopagoAdapterClient]}
          >
            {children}
          </EcommerceProvider>
        </SwrProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
