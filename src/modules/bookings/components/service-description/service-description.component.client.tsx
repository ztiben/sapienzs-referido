'use client'

import type { Service } from '@/payload-types'

import { BookingForm } from '@/modules/bookings/components/booking-form/booking-form.component.client'
import { Price } from '@/shared/components/price/price.component'
import { RichText } from '@/shared/components/rich-text/rich-text.component'
import { WhatsAppButton } from '@/shared/components/whatsapp-button/whatsapp-button.component'
import React from 'react'

import { useServiceDescription } from './use-service-description'

type Props = {
  service: Service
  whatsAppNumber?: string | null
}

export const ServiceDescription: React.FC<Props> = ({ service, whatsAppNumber }) => {
  const { amount } = useServiceDescription(service)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-2xl font-medium">{service.title}</h1>
        <div className="uppercase">
          <Price amount={amount} className="font-bold" />
        </div>
      </div>

      {service.durationMinutes ? (
        <p className="text-sm text-muted-foreground">{service.durationMinutes} min</p>
      ) : null}

      {service.description ? (
        <RichText className="" data={service.description} enableGutter={false} />
      ) : null}

      {service.redirectToWhatsApp && whatsAppNumber ? (
        <WhatsAppButton itemName={service.title} whatsAppNumber={whatsAppNumber} type="service" />
      ) : (
        <BookingForm service={service} />
      )}
    </div>
  )
}
