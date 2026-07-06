'use client'

import type { PayloadAdminBarProps } from '@payloadcms/admin-bar'

import { cn } from '@/shared/utils/cn.util'
import { PayloadAdminBar } from '@payloadcms/admin-bar'
import React from 'react'

import { collectionLabels, useAdminBar } from './use-admin-bar'

const Title: React.FC = () => <span>Dashboard</span>

export const AdminBar: React.FC<{
  adminBarProps?: PayloadAdminBarProps
}> = (props) => {
  const { adminBarProps } = props || {}
  const { show, collection, onAuthChange } = useAdminBar()

  return (
    <div
      className={cn('py-2 bg-black text-white', {
        block: show,
        hidden: !show,
      })}
    >
      <div className="container">
        <PayloadAdminBar
          {...adminBarProps}
          className="py-2 text-white"
          classNames={{
            controls: 'font-medium text-white',
            logo: 'text-white',
            user: 'text-white',
          }}
          cmsURL={process.env.NEXT_PUBLIC_SERVER_URL}
          collectionLabels={{
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore - todo fix, not sure why this is erroring
            plural: collectionLabels[collection]?.plural || 'Pages',
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore - todo fix, not sure why this is erroring
            singular: collectionLabels[collection]?.singular || 'Page',
          }}
          logo={<Title />}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - todo fix, not sure why this is erroring
          onAuthChange={onAuthChange}
          style={{
            backgroundColor: 'transparent',
            padding: 0,
            position: 'relative',
            zIndex: 'unset',
          }}
        />
      </div>
    </div>
  )
}
