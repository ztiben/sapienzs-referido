import { useAddresses } from '@payloadcms/plugin-ecommerce/client/react'
import { useState } from 'react'

export const useCheckoutAddresses = () => {
  const { addresses } = useAddresses()
  return { addresses }
}

export const useAddressesModal = () => {
  const { addresses } = useAddresses()
  const [open, setOpen] = useState(false)

  const onOpenChange = (state: boolean) => setOpen(state)
  const closeModal = () => setOpen(false)

  return { open, onOpenChange, closeModal, addresses }
}
