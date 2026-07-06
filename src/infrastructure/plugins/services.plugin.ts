import type { JoinField, Plugin } from 'payload'

import { Bookings } from '@/modules/bookings/collections/bookings/bookings.collection'
import { Services } from '@/modules/bookings/collections/services.collection'
import { StaffBlocks } from '@/modules/bookings/collections/staff-blocks.collection'
import { Staff } from '@/modules/bookings/collections/staff/staff.collection'
import { Stores } from '@/modules/bookings/collections/stores/stores.collection'

const usersBookingsField: JoinField = {
  name: 'bookings',
  type: 'join',
  collection: 'bookings',
  on: 'customer',
  admin: {
    allowCreate: false,
    defaultColumns: ['datetime', 'service', 'locationType'],
  },
}

export const servicesPlugin: Plugin = (config) => ({
  ...config,
  collections: [
    ...(config.collections || []).map((collection) => {
      if (collection.slug === 'users') {
        return {
          ...collection,
          fields: [...collection.fields, usersBookingsField],
        }
      }
      return collection
    }),
    Stores,
    Services,
    Staff,
    Bookings,
    StaffBlocks,
  ],
})
