import { OrderStatus } from '@/modules/orders/components/order-status/order-status.component'
import { Order } from '@/payload-types'
import { Price } from '@/shared/components/price/price.component'
import { Button } from '@/shared/components/ui/button'
import { formatDateTime } from '@/shared/utils/format-date-time.util'
import Link from 'next/link'

type Props = {
  order: Order
  itemLabel?: string
  itemPluralLabel?: string
  viewOrderLabel?: string
}

export const OrderItem: React.FC<Props> = ({
  order,
  itemLabel = 'Item',
  itemPluralLabel = 'Items',
  viewOrderLabel = 'View Order',
}) => {
  const itemsLabel = order.items?.length === 1 ? itemLabel : itemPluralLabel

  return (
    <div className="bg-card border rounded-lg px-4 py-2 md:px-6 md:py-4 flex flex-col sm:flex-row gap-12 sm:items-center sm:justify-between">
      <div className="flex flex-col gap-4">
        <h3 className="text-sm uppercase tracking-widest text-base-content/50 truncate max-w-32 sm:max-w-none">{`#${order.id}`}</h3>

        <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-6">
          <p className="text-xl">
            <time dateTime={order.createdAt}>
              {formatDateTime({ date: order.createdAt, format: 'MMMM dd, yyyy' })}
            </time>
          </p>

          {order.status && <OrderStatus status={order.status} />}
        </div>

        <p className="flex gap-2 text-xs text-base-content/80">
          <span>
            {order.items?.length} {itemsLabel}
          </span>
          {order.amount && (
            <>
              <span>•</span>
              <Price as="span" amount={order.amount} currencyCode={order.currency ?? undefined} />
            </>
          )}
        </p>
      </div>

      <Button variant="outline" asChild className="self-start sm:self-auto">
        <Link href={`/orders/${order.id}`}>{viewOrderLabel}</Link>
      </Button>
    </div>
  )
}
