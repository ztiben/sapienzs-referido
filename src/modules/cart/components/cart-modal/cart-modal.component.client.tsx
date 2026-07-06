'use client'

import { Price } from '@/shared/components/price/price.component'
import { Button } from '@/shared/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/components/ui/sheet'
import { ShoppingCart } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { DeleteItemButton } from '../delete-item-button/delete-item-button.component.client'
import { EditItemQuantityButton } from '../edit-item-quantity-button/edit-item-quantity-button.component.client'
import { OpenCartButton } from '../open-cart/open-cart.component'
import { useCartModal } from './use-cart-modal'

export const CartModal: React.FC = () => {
  const t = useTranslations('cart')
  const { isOpen, setIsOpen, cartEmpty, resolvedItems, subtotal, totalQuantity } = useCartModal()

  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      <SheetTrigger asChild>
        <OpenCartButton quantity={totalQuantity} />
      </SheetTrigger>

      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>{t('title')}</SheetTitle>

          <SheetDescription>{t('description')}</SheetDescription>
        </SheetHeader>

        {cartEmpty ? (
          <div className="text-center flex flex-col items-center gap-2">
            <ShoppingCart className="h-16" />
            <p className="text-center text-2xl font-bold">{t('empty')}</p>
          </div>
        ) : (
          <div className="grow flex px-4">
            <div className="flex flex-col justify-between w-full">
              <ul className="grow overflow-auto py-4">
                {resolvedItems.map((resolved, i) => {
                  if (!resolved) return <React.Fragment key={i} />

                  const { item, product, slug, image, price, quantity, variantOptionsLabel } =
                    resolved

                  return (
                    <li className="flex w-full flex-col" key={i}>
                      <div className="relative flex w-full flex-row justify-between px-1 py-4">
                        <div className="absolute z-40 -mt-2 ml-[55px]">
                          <DeleteItemButton item={item} />
                        </div>
                        <Link
                          className="z-30 flex flex-row space-x-4"
                          href={`/products/${slug}`}
                        >
                          <div className="relative h-16 w-16 cursor-pointer overflow-hidden rounded-md border bg-base-200">
                            {image?.url && (
                              <Image
                                alt={image?.alt || product?.title || ''}
                                className="h-full w-full object-cover"
                                height={94}
                                src={image.url}
                                width={94}
                              />
                            )}
                          </div>

                          <div className="flex flex-1 flex-col text-base">
                            <span className="leading-tight">{product?.title}</span>
                            {variantOptionsLabel ? (
                              <p className="text-sm text-base-content/50 capitalize">
                                {variantOptionsLabel}
                              </p>
                            ) : null}
                          </div>
                        </Link>
                        <div className="flex h-16 flex-col justify-between">
                          {typeof price === 'number' && (
                            <Price
                              amount={price}
                              className="flex justify-end space-y-2 text-right text-sm"
                            />
                          )}
                          <div className="ml-auto flex h-9 flex-row items-center rounded-lg border">
                            <EditItemQuantityButton item={item} type="minus" />
                            <p className="w-6 text-center">
                              <span className="w-full text-sm">{quantity}</span>
                            </p>
                            <EditItemQuantityButton item={item} type="plus" />
                          </div>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>

              <div className="px-4">
                <div className="py-4 text-sm text-neutral">
                  {typeof subtotal === 'number' && (
                    <div className="mb-3 flex items-center justify-between border-b pb-1 pt-1">
                      <p>{t('total')}</p>
                      <Price amount={subtotal} className="text-right text-base-content" />
                    </div>
                  )}

                  <Button asChild>
                    <Link className="w-full" href="/checkout">
                      {t('checkout')}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
