'use client'

import { Button } from '@/shared/components/ui/button'
import clsx from 'clsx'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import React from 'react'

import { useAccountNav } from './use-account-nav'

type Props = {
  className?: string
}

export const AccountNav: React.FC<Props> = ({ className }) => {
  const { pathname } = useAccountNav()
  const t = useTranslations('navigation')

  return (
    <div className={clsx(className)}>
      <ul className="flex flex-col gap-2">
        <li>
          <Button asChild variant="link">
            <Link
              href="/account"
              className={clsx('text-base-content/50 hover:text-base-content hover:no-underline', {
                'text-base-content': pathname === '/account',
              })}
            >
              {t('manageAccount')}
            </Link>
          </Button>
        </li>

        <li>
          <Button asChild variant="link">
            <Link
              href="/favorites"
              className={clsx('text-base-content/50 hover:text-base-content hover:no-underline', {
                'text-base-content': pathname === '/favorites' || pathname.includes('/favorites'),
              })}
            >
              {t('favorites')}
            </Link>
          </Button>
        </li>
      </ul>

      <hr className="w-full border-white/5" />

      <Button
        asChild
        variant="link"
        className={clsx('text-base-content/50 hover:text-base-content hover:no-underline', {
          'text-base-content': pathname === '/logout',
        })}
      >
        <Link href="/logout">{t('logOut')}</Link>
      </Button>
    </div>
  )
}
