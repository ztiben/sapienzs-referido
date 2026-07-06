'use client'

import type { Product } from '@/payload-types'

import { GridTileImage } from '@/shared/components/grid-tile-image/grid-tile-image.component'
import { Media } from '@/shared/components/media/media.component'
import React from 'react'

import { Carousel, CarouselContent, CarouselItem } from '@/shared/components/ui/carousel'

import { useGallery } from './use-gallery'

type Props = {
  gallery: NonNullable<Product['gallery']>
}

export const Gallery: React.FC<Props> = ({ gallery }) => {
  const { current, setCurrent, setApi } = useGallery(gallery)

  return (
    <div>
      <div className="relative w-full overflow-hidden mb-8">
        <Media
          resource={gallery[current].image}
          className="w-full"
          imgClassName="w-full rounded-lg"
        />
      </div>

      <Carousel setApi={setApi} className="w-full" opts={{ align: 'start', loop: false }}>
        <CarouselContent>
          {gallery.map((item, i) => {
            if (typeof item.image !== 'object') return null

            return (
              <CarouselItem
                className="basis-1/5"
                key={`${item.image.id}-${i}`}
                onClick={() => setCurrent(i)}
              >
                <GridTileImage active={i === current} media={item.image} />
              </CarouselItem>
            )
          })}
        </CarouselContent>
      </Carousel>
    </div>
  )
}
