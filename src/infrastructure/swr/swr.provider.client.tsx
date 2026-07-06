'use client'

import { swrFetcher } from '@/infrastructure/swr/swr.fetcher'
import { SWRConfig } from 'swr'

const TEN_MINUTES_MS = 10 * 60 * 1000

export const SwrProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SWRConfig
      value={{
        fetcher: swrFetcher,
        dedupingInterval: TEN_MINUTES_MS,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
        keepPreviousData: true,
      }}
    >
      {children}
    </SWRConfig>
  )
}
