'use client'

import type { Product } from '@/payload-types'

import { Button } from '@/shared/components/ui/button'
import clsx from 'clsx'
import React from 'react'

import { useVariantSelector } from './use-variant-selector'

type Props = {
  product: Product
}

export const VariantSelector: React.FC<Props> = ({ product }) => {
  const { hasVariants, variantTypes, getOptionState, onSelect } = useVariantSelector(product)

  if (!hasVariants) {
    return null
  }

  return variantTypes?.map((type) => {
    if (!type || typeof type !== 'object') {
      return <></>
    }

    const options = type.options?.docs

    if (!options || !Array.isArray(options) || !options.length) {
      return <></>
    }

    return (
      <dl className="" key={type.id}>
        <dt className="mb-4 text-sm">{type.label}</dt>
        <dd className="flex flex-wrap gap-3">
          <React.Fragment>
            {options?.map((option) => {
              if (!option || typeof option !== 'object') {
                return <></>
              }

              const { optionUrl, isAvailableForSale, isActive } = getOptionState(
                option.id,
                type.name,
              )

              return (
                <Button
                  variant={'outline'}
                  aria-disabled={!isAvailableForSale}
                  className={clsx('px-2', {
                    'bg-primary/5': isActive,
                  })}
                  disabled={!isAvailableForSale}
                  key={option.id}
                  onClick={() => onSelect(optionUrl)}
                  title={`${option.label} ${!isAvailableForSale ? ' (Out of Stock)' : ''}`}
                >
                  {option.label}
                </Button>
              )
            })}
          </React.Fragment>
        </dd>
      </dl>
    )
  })
}
