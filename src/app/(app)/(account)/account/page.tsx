import type { Metadata } from 'next'

import { AccountForm } from '@/modules/account/components/account-form/account-form.component.client'
import { mergeOpenGraph } from '@/shared/utils/merge-open-graph.util'
import configPromise from '@payload-config'
import { getTranslations } from 'next-intl/server'
import { headers as getHeaders } from 'next/headers.js'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

export default async function AccountPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })
  const t = await getTranslations('account')

  if (!user) {
    redirect(`/login?warning=${encodeURIComponent(t('loginRequired'))}`)
  }

  return (
    <div className="p-8 rounded-lg bg-base-200">
      <h1 className="text-3xl font-medium mb-8">{t('settings')}</h1>
      <AccountForm />
    </div>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata')

  return {
    description: t('accountDescription'),
    openGraph: mergeOpenGraph({
      title: t('accountTitle'),
      url: '/account',
    }),
    title: t('accountTitle'),
  }
}
