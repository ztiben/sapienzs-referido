import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/shared/utils/merge-open-graph.util'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { features } from '@/infrastructure/features'
import { CheckoutPage } from '@/modules/checkout/components/checkout-page/checkout-page.component.client'
import { getGlobal } from '@/shared/utils/get-globals.util'

export default async function Checkout() {
  if (!features.products) return notFound()

  const [mercadoPagoPayment, whatsAppPayment] = await Promise.all([
    getGlobal('mercadopago-payment'),
    getGlobal('whatsapp-payment'),
  ])

  return (
    <div className="container min-h-[90vh] flex">
      <h1 className="sr-only">Checkout</h1>

      <CheckoutPage
        mercadoPagoEnabled={mercadoPagoPayment.enabled ?? false}
        whatsAppEnabled={whatsAppPayment.enabled ?? false}
        whatsAppNumber={whatsAppPayment.whatsAppNumber ?? undefined}
      />
    </div>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata')

  return {
    description: t('checkoutDescription'),
    openGraph: mergeOpenGraph({
      title: t('checkoutTitle'),
      url: '/checkout',
    }),
    title: t('checkoutTitle'),
  }
}
