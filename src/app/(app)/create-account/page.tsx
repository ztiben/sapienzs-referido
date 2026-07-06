import type { Metadata } from 'next'

import { RenderParams } from '@/shared/components/render-params/render-params.component'
import { mergeOpenGraph } from '@/shared/utils/merge-open-graph.util'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'

import { CreateAccountForm } from '@/modules/auth/components/create-account-form/create-account-form.component.client'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'

export default async function CreateAccount() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })
  const t = await getTranslations('auth')

  if (user) {
    redirect(`/account?warning=${encodeURIComponent(t('alreadyLoggedIn'))}`)
  }

  return (
    <div className="container py-16">
      <h1 className="text-xl mb-4">{t('createAccount')}</h1>
      <RenderParams />
      <CreateAccountForm />
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
