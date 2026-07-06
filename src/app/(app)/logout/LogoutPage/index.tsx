'use client'

import { useAuth } from '@/shared/providers/auth.provider.client'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import React, { Fragment, useEffect, useState } from 'react'

export const LogoutPage: React.FC = () => {
  const { logout } = useAuth()
  const t = useTranslations('logout')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout()
        setSuccess(t('success'))
      } catch (_) {
        setError(t('alreadyLoggedOut'))
      }
    }

    void performLogout()
  }, [logout, t])

  return (
    <Fragment>
      {(error || success) && (
        <div className="prose">
          <h1>{error || success}</h1>
          <p>
            {t('whatNext')}
            <Fragment>
              {' '}
              <Link href="/shop">{t('goToShop')}</Link>
              {` ${t('toGoToShop')}`}
            </Fragment>
            {` ${t('toLogIn')} `}
            <Link href="/login">{t('clickHere')}</Link>.
          </p>
        </div>
      )}
    </Fragment>
  )
}
