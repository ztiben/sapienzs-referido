import { useAuth } from '@/shared/providers/auth.provider.client'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export const useMobileMenu = () => {
  const { user } = useAuth()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isOpen])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname, searchParams])

  return { user, isOpen, setIsOpen }
}
