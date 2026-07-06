import type { Footer } from '@/payload-types'

import { FooterMenu } from '@/infrastructure/footer/components/menu/menu.component'
import { LogoIcon } from '@/shared/components/icons/logo/logo.component'
import { getCachedGlobal } from '@/shared/utils/get-globals.util'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Suspense } from 'react'

const { COMPANY_NAME } = process.env

export async function Footer() {
  const footer: Footer = await getCachedGlobal('footer', 1)()
  const menu = footer.navItems || []
  const copyrightDate = new Date().getFullYear()
  const skeleton = 'w-full h-6 animate-pulse rounded bg-neutral-200'
  const t = await getTranslations('common')

  return (
    <footer className="text-sm">
      <div className="container">
        <div className="flex w-full flex-col gap-6 border-t py-12 text-sm md:flex-row md:gap-12">
          <div>
            <Link className="flex items-center gap-2 text-base-content md:pt-1" href="/">
              <LogoIcon className="w-6 h-auto" />
              {COMPANY_NAME && <span className="sr-only">{COMPANY_NAME}</span>}
            </Link>
          </div>
          <Suspense
            fallback={
              <div className="flex h-[188px] w-[200px] flex-col gap-2">
                <div className={skeleton} />
                <div className={skeleton} />
                <div className={skeleton} />
                <div className={skeleton} />
                <div className={skeleton} />
                <div className={skeleton} />
              </div>
            }
          >
            <FooterMenu menu={menu} />
          </Suspense>
        </div>
      </div>
      {COMPANY_NAME && (
        <div className="border-t py-6 text-sm">
          <div className="container mx-auto flex w-full flex-col items-center gap-1 md:flex-row md:gap-0">
            <p>
              &copy; {copyrightDate} {COMPANY_NAME}
              {COMPANY_NAME.length && !COMPANY_NAME.endsWith('.') ? '.' : ''}{' '}
              {t('allRightsReserved')}
            </p>
          </div>
        </div>
      )}
    </footer>
  )
}
