import type { Address, Booking, Service, Staff } from '@/payload-types'

import {
  buildAvailabilityQuery,
  buildBookingBody,
  buildStaffQuery,
  canSubmitBooking,
  formatTimeSlots,
  getInStoreStores,
  getSupportedModalities,
  type Modality,
} from '@/modules/bookings/bl/booking-form.bl'
import { checkDateDisabled } from '@/modules/bookings/bl/date-disabled.bl'
import { useAuth } from '@/shared/providers/auth.provider.client'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'

type BookingFormData = {
  modality: Modality | undefined
  storeId: number | undefined
  staffId: number | undefined
  selectedDate: Date | undefined
  selectedSlot: string | undefined
}

const createBooking = async (url: string, { arg }: { arg: Partial<Booking> }) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg),
    credentials: 'include',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.message || '')
  }

  return res.json()
}

export const useBookingForm = (service: Service) => {
  const { user } = useAuth()
  const t = useTranslations('booking')

  const formMethods = useForm<BookingFormData>({
    defaultValues: {
      modality: undefined,
      storeId: undefined,
      staffId: undefined,
      selectedDate: undefined,
      selectedSlot: undefined,
    },
  })
  const { watch, setValue, reset, handleSubmit } = formMethods

  const modality = watch('modality')
  const storeId = watch('storeId')
  const staffId = watch('staffId')
  const selectedDate = watch('selectedDate')
  const selectedSlot = watch('selectedSlot')

  const [address, setAddress] = useState<Partial<Address> | undefined>(undefined)
  const [dateDialogOpen, setDateDialogOpen] = useState(false)
  const [timeDialogOpen, setTimeDialogOpen] = useState(false)

  const supportedModalities = getSupportedModalities(service)
  const stores = getInStoreStores(service, modality)

  const staffReady =
    modality != null &&
    (modality !== 'inStore' || storeId != null) &&
    (modality !== 'delivery' || address != null)

  const { data: staffData } = useSWR<{ docs: Staff[] }>(
    staffReady ? buildStaffQuery({ serviceId: service.id, modality: modality!, storeId }) : null,
    { keepPreviousData: false },
  )
  const staffList = staffData?.docs ?? []
  const selectedStaff = staffList.find((s) => s.id === staffId)

  const { data: availabilityData, mutate: mutateAvailability } = useSWR<{ slots: string[] }>(
    staffId != null && selectedDate != null
      ? buildAvailabilityQuery({ staffId, serviceId: service.id, date: selectedDate })
      : null,
    { keepPreviousData: false },
  )
  const timeSlots = availabilityData?.slots ? formatTimeSlots(availabilityData.slots) : []

  const { trigger, isMutating } = useSWRMutation('/api/bookings', createBooking)

  const onModalityChange = (m: Modality) => {
    setValue('modality', m)
    setValue('storeId', undefined)
    setAddress(undefined)
    setValue('staffId', undefined)
    setValue('selectedDate', undefined)
    setValue('selectedSlot', undefined)
  }

  const onStoreChange = (id: number) => {
    setValue('storeId', id)
    setValue('staffId', undefined)
    setValue('selectedDate', undefined)
    setValue('selectedSlot', undefined)
  }

  const onStaffChange = (id: number) => {
    setValue('staffId', id)
    setValue('selectedDate', undefined)
    setValue('selectedSlot', undefined)
  }

  const onSelectDate = (date: Date | undefined) => {
    setValue('selectedDate', date)
    setValue('selectedSlot', undefined)
    setDateDialogOpen(false)
  }

  const onSelectSlot = (slot: string) => {
    setValue('selectedSlot', slot)
    setTimeDialogOpen(false)
  }

  useEffect(() => {
    if (supportedModalities.length === 1 && modality == null) {
      onModalityChange(supportedModalities[0]!)
    }
  }, [modality, supportedModalities, onModalityChange])

  useEffect(() => {
    if (stores.length === 1 && storeId == null) {
      onStoreChange(stores[0]!.id)
    }
  }, [stores, storeId, onStoreChange])

  useEffect(() => {
    if (staffList.length === 1 && staffId == null) {
      onStaffChange(staffList[0]!.id)
    }
  }, [staffList, staffId, onStaffChange])

  const isDateDisabled = (date: Date) => checkDateDisabled(date, service, selectedStaff ?? {})

  const canBook = canSubmitBooking({
    modality,
    storeId,
    staffId,
    selectedDate,
    selectedSlot,
    hasAddress: address != null,
  })

  const onSubmit = handleSubmit(async (data) => {
    if (!canBook || !user || !data.selectedDate || !data.selectedSlot) return

    const body = buildBookingBody({
      serviceId: service.id,
      modality: data.modality!,
      staffId: data.staffId!,
      storeId: data.storeId,
      addressId: address?.id,
      selectedSlot: data.selectedSlot,
    })

    try {
      await trigger(body)
      await mutateAvailability()
      toast.success(t('confirmed'))
      reset()
      setAddress(undefined)
    } catch (error) {
      toast.error((error instanceof Error && error.message) || t('failed'))
    }
  })

  return {
    isAuthenticated: Boolean(user),
    onSubmit,
    isSubmitting: isMutating,
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
  }
}
