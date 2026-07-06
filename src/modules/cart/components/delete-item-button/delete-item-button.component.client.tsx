'use client'

import { type CartItem } from '@/modules/cart/bl/cart-item-display.bl'
import clsx from 'clsx'
import { XIcon } from 'lucide-react'
import React from 'react'

import { useDeleteItemButton } from './use-delete-item-button'

type Props = {
  item: CartItem
}

export const DeleteItemButton: React.FC<Props> = ({ item }) => {
  const { disabled, onDelete } = useDeleteItemButton(item)

  return (
    <form>
      <button
        aria-label="Eliminar item del carrito"
        className={clsx(
          'ease hover:cursor-pointer flex h-[17px] w-[17px] items-center justify-center rounded-full bg-base-200 transition-all duration-200',
          {
            'cursor-not-allowed px-0': disabled,
          },
        )}
        disabled={disabled}
        onClick={onDelete}
        type="button"
      >
        <XIcon className="hover:text-accent-3 mx-px h-4 w-4" />
      </button>
    </form>
  )
}
