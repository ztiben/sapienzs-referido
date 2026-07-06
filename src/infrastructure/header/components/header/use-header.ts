import { usePathname } from 'next/navigation'

export const useHeader = () => {
  const pathname = usePathname()
  return { pathname }
}
