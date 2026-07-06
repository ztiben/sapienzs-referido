import type { User } from '@/payload-types'

import { useSelectedLayoutSegments } from 'next/navigation'
import { useState } from 'react'

export const collectionLabels = {
  pages: { plural: 'Pages', singular: 'Page' },
  posts: { plural: 'Posts', singular: 'Post' },
  projects: { plural: 'Projects', singular: 'Project' },
}

export const useAdminBar = () => {
  const segments = useSelectedLayoutSegments()
  const [show, setShow] = useState(false)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - todo fix, not sure why this is erroring
  const collection = collectionLabels?.[segments?.[1]] ? segments?.[1] : 'pages'

  const onAuthChange = (user: User) => {
    const canSeeAdmin =
      user?.roles && Array.isArray(user?.roles) && user?.roles?.includes('admin')
    setShow(Boolean(canSeeAdmin))
  }

  return { show, collection, onAuthChange }
}
