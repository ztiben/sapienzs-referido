import { useRouter } from 'next/navigation'

export const useLivePreviewListener = () => {
  const router = useRouter()

  return {
    refresh: router.refresh,
    serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  }
}
