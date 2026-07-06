'use client'

import type { Address, Service } from '@/payload-types'

import { CheckoutAddresses } from '@/shared/components/checkout-addresses/checkout-addresses.component.client'
import { FormItem } from '@/shared/components/form-item/form-item.component'
import { Button } from '@/shared/components/ui/button'
import { Calendar } from '@/shared/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog'
import { Label } from '@/shared/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import clsx from 'clsx'
import { format } from 'date-fns'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import React from 'react'

import type { Modality } from '@/modules/bookings/bl/booking-form.bl'

import { useBookingForm } from './use-booking-form'

type Props = {
  service: Service
}

export const BookingForm: React.FC<Props> = ({ service }) => {
  const t = useTranslations('booking')
  const {
    isAuthenticated,
    onSubmit,
    isSubmitting,
    canBook,
    supportedModalities,
    modality,
    onModalityChange,
    stores,
    storeId,
    onStoreChange,
    address,
    setAddress,
    staffList,
    staffId,
    onStaffChange,
    selectedDate,
    onSelectDate,
    isDateDisabled,
    dateDialogOpen,
    setDateDialogOpen,
    selectedSlot,
    timeSlots,
    onSelectSlot,
    timeDialogOpen,
    setTimeDialogOpen,
  } = useBookingForm(service)

  const modalityLabels: Record<NonNullable<Modality>, string> = {
    inStore: t('inStore'),
    delivery: t('delivery'),
  }

  if (!isAuthenticated) {
    return (
      <div className="p-4 lg:p-6 border bg-base-200 rounded-[0.8rem]">
        <p className="text-sm text-muted-foreground mb-4">{t('loginRequired')}</p>
        <Button asChild variant="outline">
          <Link href="/login">{t('logIn')}</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 border bg-base-200 rounded-[0.8rem]">
      <form onSubmit={onSubmit}>
        <div className="mb-4 last:mb-0">
          <h2 className="text-xl font-medium mb-4">{t('book')}</h2>

          {supportedModalities.length > 1 && (
            <div className="mb-6 last:mb-0">
              <FormItem>
                <Label htmlFor="modality">{t('selectModality')}</Label>
                <Select
                  onValueChange={(val) => onModalityChange(val as Modality)}
                  value={modality ?? ''}
                >
                  <SelectTrigger className="w-full" id="modality">
                    <SelectValue placeholder={t('selectModality')} />
                  </SelectTrigger>
                  <SelectContent>
                    {supportedModalities.map((val) => (
                      <SelectItem className="w-full" key={val} value={val!}>
                        {modalityLabels[val!]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            </div>
          )}

          {modality === 'inStore' && stores.length > 1 && (
            <div className="mb-6 last:mb-0">
              <FormItem>
                <Label htmlFor="store">{t('selectStore')}</Label>
                <Select
                  onValueChange={(val) => onStoreChange(Number(val))}
                  value={typeof storeId === 'number' ? String(storeId) : ''}
                >
                  <SelectTrigger className="w-full" id="store">
                    <SelectValue placeholder={t('selectStore')} />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map((val) => (
                      <SelectItem className="w-full" key={val.id} value={String(val.id)}>
                        {val.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            </div>
          )}

          {modality === 'delivery' && (
            <div className="mb-6 last:mb-0">
              <CheckoutAddresses
                selectedAddress={address as Address | undefined}
                setAddress={setAddress}
                heading={t('deliveryAddress')}
                description={t('deliveryDescription')}
              />
            </div>
          )}

          {modality != null &&
            (modality !== 'inStore' || storeId != null) &&
            (modality !== 'delivery' || address !== undefined) &&
            staffList.length > 1 && (
              <div className="mb-6 last:mb-0">
                <FormItem>
                  <Label htmlFor="staff">{t('selectProfessional')}</Label>
                  <Select
                    onValueChange={(val) => onStaffChange(Number(val))}
                    value={typeof staffId === 'number' ? String(staffId) : ''}
                  >
                    <SelectTrigger className="w-full" id="staff">
                      <SelectValue placeholder={t('selectProfessional')} />
                    </SelectTrigger>
                    <SelectContent>
                      {staffList.map((val) => (
                        <SelectItem className="w-full" key={val.id} value={String(val.id)}>
                          {val.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              </div>
            )}

          {staffId != null && (
            <div className="mb-6 last:mb-0">
              <FormItem>
                <Label>{t('selectDate')}</Label>
                <Dialog open={dateDialogOpen} onOpenChange={setDateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={clsx('px-2', {
                        'bg-primary/5 text-base-content': selectedDate !== undefined,
                      })}
                    >
                      {selectedDate ? format(selectedDate, 'PPP') : t('pickDate')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-fit">
                    <DialogHeader>
                      <DialogTitle>{t('selectDate')}</DialogTitle>
                    </DialogHeader>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={onSelectDate}
                      disabled={isDateDisabled}
                    />
                  </DialogContent>
                </Dialog>
              </FormItem>
            </div>
          )}

          {staffId != null && selectedDate != null && (
            <div className="mb-6 last:mb-0">
              <FormItem>
                <Label>{t('selectTime')}</Label>
                <Dialog open={timeDialogOpen} onOpenChange={setTimeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={clsx('px-2', {
                        'bg-primary/5 text-base-content': selectedSlot != null,
                      })}
                    >
                      {timeSlots.find((s) => s.value === selectedSlot)?.label ?? t('pickTime')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-fit">
                    <DialogHeader>
                      <DialogTitle>
                        {t('selectTime')}
                        <span className="block text-sm font-normal text-muted-foreground">
                          {format(selectedDate, 'PPP')}
                        </span>
                      </DialogTitle>
                    </DialogHeader>
                    {timeSlots.length > 0 ? (
                      <div className="grid grid-cols-4 gap-2">
                        {timeSlots.map((slot) => (
                          <Button
                            key={slot.value}
                            type="button"
                            variant="ghost"
                            aria-pressed={selectedSlot === slot.value}
                            className={clsx('px-3 py-1 text-sm', {
                              'bg-primary/5 text-base-content': selectedSlot === slot.value,
                            })}
                            onClick={() => onSelectSlot(slot.value)}
                          >
                            {slot.label}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">{t('noSlots')}</p>
                    )}
                  </DialogContent>
                </Dialog>
              </FormItem>
            </div>
          )}

          <Button type="submit" variant="default" disabled={!canBook || isSubmitting}>
            {isSubmitting ? t('booking') : t('book')}
          </Button>
        </div>
      </form>
    </div>
  )
}
