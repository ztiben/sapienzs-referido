'use client'

import { Button } from '@/shared/components/ui/button'
import { useTranslations } from 'next-intl'

type Props = {
  itemName: string
  whatsAppNumber: string
  type: 'product' | 'service'
}

export function WhatsAppButton({ itemName, whatsAppNumber, type }: Props) {
  const t = useTranslations('whatsapp')

  const message =
    type === 'product'
      ? t('productMessage', { name: itemName })
      : t('serviceMessage', { name: itemName })

  const href = `https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(message)}`

  return (
    <Button
      asChild
      variant="outline"
      className="hover:opacity-90 bg-[#25D366] text-white border-[#25D366] hover:bg-[#25D366] hover:text-white w-fit"
    >
      <a href={href} target="_blank" rel="noopener noreferrer">
        {type === 'product' ? t('buyOnWhatsApp') : t('bookOnWhatsApp')}
      </a>
    </Button>
  )
}
