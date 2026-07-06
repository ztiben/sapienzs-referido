import type { Metadata } from 'next'

import { AddressListing } from '@/modules/account/components/address-listing/address-listing.component.client'
import { CreateAddressModal } from '@/shared/components/create-address-modal/create-address-modal.component.client'
import { mergeOpenGraph } from '@/shared/utils/merge-open-graph.util'
import configPromise from '@payload-config'
import { getTranslations } from 'next-intl/server'
import { headers as getHeaders } from 'next/headers.js'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

export default async function AddressesPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })
  const t = await getTranslations('account')

  if (!user) {
    redirect(`/login?warning=${encodeURIComponent(t('loginRequired'))}`)
  }

  return (
    <>
      <div className="p-8 rounded-lg bg-base-200">
        <h1 className="text-3xl font-medium mb-8">{t('addresses')}</h1>

        <div className="mb-8">
          <AddressListing />
        </div>

        <CreateAddressModal />
      </div>
    </>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata')

  return {
    description: t('addressesDescription'),
    openGraph: mergeOpenGraph({
      title: t('addressesTitle'),
      url: '/account/addresses',
    }),
    title: t('addressesTitle'),
  }
}
