'use client'

import { type CartItem } from '@/modules/cart/bl/cart-item-display.bl'
import clsx from 'clsx'
import { MinusIcon, PlusIcon } from 'lucide-react'
import React from 'react'

import { useEditItemQuantityButton } from './use-edit-item-quantity-button'

type Props = {
  item: CartItem
  type: 'minus' | 'plus'
}

export const EditItemQuantityButton: React.FC<Props> = ({ type, item }) => {
  const { disabled, isLoading, onChange } = useEditItemQuantityButton(item, type)

  return (
    <form>
      <button
        disabled={disabled || isLoading}
        aria-label={type === 'plus' ? 'Increase item quantity' : 'Reduce item quantity'}
        className={clsx(
          'ease hover:cursor-pointer flex h-full min-w-[36px] max-w-[36px] flex-none items-center justify-center rounded-full px-2 transition-all duration-200 hover:border-neutral-800 hover:opacity-80',
          {
            'cursor-not-allowed': disabled || isLoading,
            'ml-auto': type === 'minus',
          },
        )}
        onClick={onChange}
        type="button"
      >
        {type === 'plus' ? (
          <PlusIcon className="h-4 w-4 hover:text-neutral" />
        ) : (
          <MinusIcon className="h-4 w-4 hover:text-neutral" />
        )}
      </button>
    </form>
  )
}
