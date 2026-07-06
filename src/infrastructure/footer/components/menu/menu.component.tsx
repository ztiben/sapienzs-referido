import type { Footer } from '@/payload-types'

import { CMSLink } from '@/shared/components/link/link.component'

interface Props {
  menu: Footer['navItems']
}

export function FooterMenu({ menu }: Props) {
  if (!menu?.length) return null

  return (
    <nav>
      <ul className="grid grid-cols-2 gap-8 md:grid-cols-3">
        {menu.map((column) => (
          <li key={column.id} className="overflow-hidden">
            <ul className="flex flex-col gap-2">
              {column.links?.map((item) => (
                <li key={item.id}>
                  <CMSLink appearance="link" {...item.link} />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  )
}
