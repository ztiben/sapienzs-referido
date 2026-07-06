import { usePathname, useRouter, useSearchParams } from 'next/navigation'

type ShopType = { id: string; title: string }

export const useTypeItem = (shopType: ShopType, defaultShopType: string) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const type = searchParams.get('type')
  const effective = type ?? defaultShopType
  const isActive = effective === shopType.id

  const setQuery = () => {
    const params = new URLSearchParams(searchParams.toString())

    if (isActive) {
      params.delete('type')
    } else {
      params.set('type', shopType.id)
    }

    router.push(pathname + '?' + params.toString())
  }

  return { isActive, setQuery }
}
