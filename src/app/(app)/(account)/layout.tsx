import type { ReactNode } from 'react'

import { features } from '@/infrastructure/features'
import { AccountNav } from '@/modules/account/components/account-nav/account-nav.component.client'
import { RenderParams } from '@/shared/components/render-params/render-params.component'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'

export default async function RootLayout({ children }: { children: ReactNode }) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  return (
    <div>
      <div className="container">
        <RenderParams className="" />
      </div>

      <div className="container mt-16 pb-8 flex gap-8">
        {user && (
          <AccountNav
            className="max-w-62 grow flex-col items-start gap-4 hidden md:flex"
            showOrders={features.products}
            showBookings={features.services}
          />
        )}

        <div className="flex flex-col gap-12 grow">{children}</div>
      </div>
    </div>
  )
}
