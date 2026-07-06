import { SHOP_TYPES } from '@/modules/products/constants/search.constants'
import { getTranslations } from 'next-intl/server'
import { TypeFilterItem } from '../type-item/type-item.component.client'

type Props = {
  defaultShopType: string
}

async function TypeFilterList({ defaultShopType }: Props) {
  const t = await getTranslations('shop')

  return (
    <div>
      <h3 className="mb-2">{t('type')}</h3>

      <ul>
        {SHOP_TYPES.map((shopType) => (
          <TypeFilterItem key={shopType.id} shopType={shopType} defaultShopType={defaultShopType} />
        ))}
      </ul>
    </div>
  )
}

export function TypeFilter({ defaultShopType }: Props) {
  return <TypeFilterList defaultShopType={defaultShopType} />
}
