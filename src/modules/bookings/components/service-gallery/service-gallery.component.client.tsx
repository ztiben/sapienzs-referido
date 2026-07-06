'use client'

import type { Media as MediaType } from '@/payload-types'

import { GridTileImage } from '@/shared/components/grid-tile-image/grid-tile-image.component'
import { Media } from '@/shared/components/media/media.component'
import React from 'react'

import { Carousel, CarouselContent, CarouselItem } from '@/shared/components/ui/carousel'

import { useServiceGallery } from './use-service-gallery'

type Props = {
  images: MediaType[]
}

export const ServiceGallery: React.FC<Props> = ({ images }) => {
  const { current, setCurrent } = useServiceGallery()

  return (
    <div>
      <div className="relative w-full overflow-hidden mb-8">
        <Media resource={images[current]} className="w-full" imgClassName="w-full rounded-lg" />
      </div>

      <Carousel className="w-full" opts={{ align: 'start', loop: false }}>
        <CarouselContent>
          {images.map((image, i) => (
            <CarouselItem
              className="basis-1/5"
              key={`${image.id}-${i}`}
              onClick={() => setCurrent(i)}
            >
              <GridTileImage active={i === current} media={image} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  )
}
