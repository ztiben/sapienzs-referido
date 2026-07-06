import type { BasePayload, PayloadRequest } from 'payload'
import { getAvailableSlots } from '../bl/available-slots.bl'
import type { ServiceSlot } from '../models/booking.model'

const MS_PER_DAY = 24 * 60 * 60 * 1000

interface GetAvailableSlotsOptions {
  payload: BasePayload
  req?: PayloadRequest
  staffId: number
  serviceId: number
  date: Date
}

export const getAvailableSlotsAvailability = async ({
  payload,
  req,
  staffId,
  serviceId,
  date,
}: GetAvailableSlotsOptions): Promise<ServiceSlot[]> => {
  const startOfDay = date
  const endOfDay = new Date(date.getTime() + MS_PER_DAY - 1)

  const [staff, service, blocksResult, bookingsResult] = await Promise.all([
    payload.findByID({ collection: 'staff', id: staffId, depth: 0, req }),
    payload.findByID({ collection: 'services', id: serviceId, depth: 0, req }),
    payload.find({
      collection: 'staff-blocks',
      where: { staff: { equals: staffId } },
      depth: 0,
      limit: 0,
      req,
    }),
    payload.find({
      collection: 'bookings',
      where: {
        and: [
          { staff: { equals: staffId } },
          { startDatetime: { greater_than_equal: startOfDay.toISOString() } },
          { startDatetime: { less_than_equal: endOfDay.toISOString() } },
        ],
      },
      depth: 0,
      limit: 0,
      req,
    }),
  ])

  return getAvailableSlots({
    durationMinutes: service.durationMinutes,
    bufferMinutes: service.bufferMinutes,
    workStartHour: staff.workStartTime,
    workEndHour: staff.workEndTime,
    workDays: staff.workDays,
    date,
    blocks: blocksResult.docs,
    bookings: bookingsResult.docs,
  })
}
