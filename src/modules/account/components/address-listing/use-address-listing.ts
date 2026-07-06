import { useAddresses } from '@payloadcms/plugin-ecommerce/client/react'

export const useAddressListing = () => {
  const { addresses } = useAddresses()
  return { addresses }
}
