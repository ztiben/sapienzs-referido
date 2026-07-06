import { usePathname } from 'next/navigation'

export const useAccountNav = () => {
  const pathname = usePathname()
  return { pathname }
}
