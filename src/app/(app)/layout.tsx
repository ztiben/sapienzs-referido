import { type ReactNode, Suspense } from 'react'

import { features } from '@/infrastructure/features'
import { Footer } from '@/infrastructure/footer/components/footer/footer.component'
import { Header } from '@/infrastructure/header/components/header-container/header-container.component'
import { CartModal } from '@/modules/cart/components/cart-modal/cart-modal.component.client'
import { OpenCartButton } from '@/modules/cart/components/open-cart/open-cart.component'
import { AdminBar } from '@/shared/components/admin-bar/admin-bar.component.client'
import { LivePreviewListener } from '@/shared/components/live-preview-listener/live-preview-listener.component.client'
import { Providers } from '@/shared/providers/app.provider'
import { GeistSans } from 'geist/font/sans'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale } from 'next-intl/server'
import { draftMode } from 'next/headers'
import './globals.css'

const { THEME } = process.env

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { isEnabled: draft } = await draftMode()
  const locale = await getLocale()
  const theme = THEME || 'light'

  return (
    <html className={GeistSans.variable} data-theme={theme} lang={locale} suppressHydrationWarning>
      <head></head>
      <body>
        <NextIntlClientProvider>
          <Providers>
            <AdminBar />
            {draft && <LivePreviewListener />}

            <Header
              cartSlot={
                features.products ? (
                  <Suspense fallback={<OpenCartButton />}>
                    <CartModal />
                  </Suspense>
                ) : null
              }
            />
            <main>{children}</main>
            <Footer />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
