'use client'

import { Button } from '@/shared/components/ui/button'
import clsx from 'clsx'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import React from 'react'

import { useAccountNav } from './use-account-nav'

type Props = {
  className?: string
  showOrders?: boolean
  showBookings?: boolean
}

export const AccountNav: React.FC<Props> = ({
  className,
  showOrders = false,
  showBookings = false,
}) => {
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
              href="/account/addresses"
              className={clsx('text-base-content/50 hover:text-base-content hover:no-underline', {
                'text-base-content': pathname === '/account/addresses',
              })}
            >
              {t('addresses')}
            </Link>
          </Button>
        </li>

        {showOrders && (
          <li>
            <Button
              asChild
              variant="link"
              className={clsx('text-base-content/50 hover:text-base-content hover:no-underline', {
                'text-base-content': pathname === '/orders' || pathname.includes('/orders'),
              })}
            >
              <Link href="/orders">{t('orders')}</Link>
            </Button>
          </li>
        )}

        {showBookings && (
          <li>
            <Button
              asChild
              variant="link"
              className={clsx('text-base-content/50 hover:text-base-content hover:no-underline', {
                'text-base-content': pathname === '/bookings' || pathname.includes('/bookings'),
              })}
            >
              <Link href="/bookings">{t('bookings')}</Link>
            </Button>
          </li>
        )}
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
