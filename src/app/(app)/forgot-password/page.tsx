import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/shared/utils/merge-open-graph.util'
import { getTranslations } from 'next-intl/server'

import { ForgotPasswordForm } from '@/modules/auth/components/forgot-password-form/forgot-password-form.component.client'

export default async function ForgotPasswordPage() {
  return (
    <div className="container py-16">
      <ForgotPasswordForm />
    </div>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata')

  return {
    description: t('forgotPasswordDescription'),
    openGraph: mergeOpenGraph({
      title: t('forgotPasswordTitle'),
      url: '/forgot-password',
    }),
    title: t('forgotPasswordTitle'),
  }
}
