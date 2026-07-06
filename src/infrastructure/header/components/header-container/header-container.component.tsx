import { getCachedGlobal } from '@/shared/utils/get-globals.util'
import type { ReactNode } from 'react'

import { HeaderClient } from '../header/header.component.client'
import './index.css'

export async function Header({ cartSlot }: { cartSlot?: ReactNode }) {
  const header = await getCachedGlobal('header', 1)()

  return <HeaderClient header={header} cartSlot={cartSlot} />
}
