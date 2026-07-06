import type { ArrayField, Field } from 'payload'

import type { LinkAppearances } from './link.field'

import { deepMerge } from '@/shared/utils/deep-merge.util'
import { link } from './link.field'

type LinkGroupType = (options?: {
  appearances?: LinkAppearances[] | false
  overrides?: Partial<ArrayField>
}) => Field

export const linkGroup: LinkGroupType = ({ appearances, overrides = {} } = {}) => {
  const generatedLinkGroup: Field = {
    name: 'links',
    type: 'array',
    fields: [
      link({
        appearances,
      }),
    ],
  }

  return deepMerge(generatedLinkGroup, overrides)
}
