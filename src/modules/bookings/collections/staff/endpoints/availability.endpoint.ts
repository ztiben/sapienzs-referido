import { getAvailableSlotsAvailability } from '@/modules/bookings/uc/available-slots.uc'
import type { Endpoint } from 'payload'

export const availabilityEndpoint: Endpoint = {
  path: '/:id/availability',
  method: 'get',
  handler: async (req) => {
    const url = new URL(req.url ?? '', process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost')
    const staffParam = req.routeParams?.id
    const serviceParam = url.searchParams.get('service')
    const dateParam = url.searchParams.get('date')

    if (!staffParam || !serviceParam || !dateParam) {
      return Response.json(
        { error: 'staff id (path), service and date query params are required' },
        { status: 400 },
      )
    }

    const staffId = parseInt(String(staffParam), 10)
    const serviceId = parseInt(serviceParam, 10)
    if (isNaN(staffId) || isNaN(serviceId)) {
      return Response.json({ error: 'staff id and service must be numbers' }, { status: 400 })
    }

    const date = new Date(dateParam)
    if (isNaN(date.getTime())) {
      return Response.json({ error: 'date must be a valid ISO 8601 datetime string' }, { status: 400 })
    }

    const slots = await getAvailableSlotsAvailability({
      payload: req.payload,
      req,
      staffId,
      serviceId,
      date,
    }).catch(() => null)

    if (slots === null) {
      return Response.json({ error: 'staff or service not found' }, { status: 404 })
    }

    return Response.json({ slots })
  },
}
