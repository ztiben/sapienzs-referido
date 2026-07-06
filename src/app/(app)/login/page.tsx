import type { Metadata } from 'next'

import { RenderParams } from '@/shared/components/render-params/render-params.component'
import Link from 'next/link'

import { LoginForm } from '@/modules/auth/components/login-form/login-form.component.client'
import configPromise from '@payload-config'
import { getTranslations } from 'next-intl/server'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

export default async function Login() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })
  const t = await getTranslations('auth')

  if (user) {
    redirect(`/account?warning=${encodeURIComponent(t('alreadyLoggedIn'))}`)
  }

  return (
    <div className="container">
      <div className="max-w-xl mx-auto my-12">
        <RenderParams />

        <h1 className="mb-4 text-[1.8rem]">{t('login')}</h1>
        <p className="mb-8">
          {t('loginDescription')}
          <Link href="/admin/collections/users">{t('adminLink')}</Link>.
        </p>
        <LoginForm />
      </div>
    </div>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata')

  return {
    description: t('loginDescription'),
    openGraph: {
      title: t('loginTitle'),
      url: '/login',
    },
    title: t('loginTitle'),
  }
}
