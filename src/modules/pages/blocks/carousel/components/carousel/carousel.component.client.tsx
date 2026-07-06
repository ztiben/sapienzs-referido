'use client'
import type { DisplayItem } from '@/shared/utils/to-display-item.util'
import type { Media } from '@/payload-types'

import { GridTileImage } from '@/shared/components/grid-tile-image/grid-tile-image.component'
import { Carousel, CarouselContent, CarouselItem } from '@/shared/components/ui/carousel'
import AutoScroll from 'embla-carousel-auto-scroll'
import Link from 'next/link'
import React from 'react'

export const CarouselClient: React.FC<{ items: DisplayItem[] }> = ({ items }) => {
  if (!items?.length) return null

  // Purposefully duplicating items to make the carousel loop and not run out of items on wide screens.
  const carouselItems = [...items, ...items, ...items]

  return (
    <Carousel
      className="w-full"
      opts={{ align: 'start', loop: true }}
      plugins={[
        AutoScroll({
          playOnInit: true,
          speed: 1,
          stopOnInteraction: false,
          stopOnMouseEnter: true,
        }),
      ]}
    >
      <CarouselContent>
        {carouselItems.map((item, i) => (
          <CarouselItem
            className="relative aspect-square h-[30vh] max-h-68.75 w-2/3 max-w-118.75 flex-none md:w-1/3"
            key={`${item.slug}${i}`}
          >
            <Link className="relative h-full w-full" href={`/${item.collection}/${item.slug}`}>
              <GridTileImage
                label={{ amount: item.price, title: item.title }}
                media={item.image as Media}
              />
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}
