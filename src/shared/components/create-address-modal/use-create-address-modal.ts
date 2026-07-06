import type { Address } from '@/payload-types'

import { useState } from 'react'

export const useCreateAddressModal = (callback?: (address: Partial<Address>) => void) => {
  const [open, setOpen] = useState(false)

  const onOpenChange = (state: boolean) => {
    setOpen(state)
  }

  const handleCallback = (data: Partial<Address>) => {
    setOpen(false)
    callback?.(data)
  }

  return { open, onOpenChange, handleCallback }
}
