'use client'

import type { Header } from '@/payload-types'

import { CMSLink } from '@/shared/components/link/link.component'
import { Button } from '@/shared/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/components/ui/sheet'
import { MenuIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import React from 'react'

import { useMobileMenu } from './use-mobile-menu'

interface Props {
  menu: Header['navItems']
}

export const MobileMenu: React.FC<Props> = ({ menu }) => {
  const t = useTranslations('navigation')
  const { user, isOpen, setIsOpen } = useMobileMenu()

  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      <SheetTrigger className="relative flex h-11 w-11 items-center justify-center rounded-md border text-base-content transition-colors">
        <MenuIcon className="h-4" />
      </SheetTrigger>

      <SheetContent side="left" className="px-4">
        <SheetHeader className="px-0 pt-4 pb-0">
          <SheetTitle>{t('myStore')}</SheetTitle>

          <SheetDescription />
        </SheetHeader>

        <div className="py-4">
          {menu?.length ? (
            <ul className="flex w-full flex-col">
              {menu.map((item) => (
                <li className="py-2" key={item.id}>
                  <CMSLink {...item.link} appearance="link" />
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {user ? (
          <div className="mt-4">
            <h2 className="text-xl mb-4">{t('myAccount')}</h2>
            <hr className="my-2" />
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/favorites">{t('favorites')}</Link>
              </li>
              <li>
                <Link href="/account">{t('manageAccount')}</Link>
              </li>
              <li className="mt-6">
                <Button asChild variant="outline">
                  <Link href="/logout">{t('logOut')}</Link>
                </Button>
              </li>
            </ul>
          </div>
        ) : (
          <div>
            <h2 className="text-xl mb-4">{t('myAccount')}</h2>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button asChild className="w-full sm:flex-1" variant="outline">
                <Link href="/login">{t('logIn')}</Link>
              </Button>
              <span className="text-center text-sm text-muted-foreground sm:text-base">
                {t('or')}
              </span>
              <Button asChild className="w-full sm:flex-1">
                <Link href="/create-account">{t('createAnAccount')}</Link>
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
