'use client'
import { Button } from '@/shared/components/ui/button'
import { CopyIcon } from '@payloadcms/ui/icons/Copy'
import React from 'react'

import { useCopyButton } from './use-copy-button'

type Props = {
  code: string
}

export const CopyButton: React.FC<Props> = ({ code }) => {
  const { text, copy } = useCopyButton(code)

  return (
    <div className="flex justify-end align-middle">
      <Button className="flex gap-1" variant={'secondary'} onClick={copy}>
        <p>{text}</p>
        <CopyIcon />
      </Button>
    </div>
  )
}
