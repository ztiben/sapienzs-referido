import { ArchiveBlock } from '@/modules/pages/blocks/archive-block/components/archive-block/archive-block.component'
import { BannerBlock } from '@/modules/pages/blocks/banner/components/banner/banner.component'
import { CallToActionBlock } from '@/modules/pages/blocks/call-to-action/components/call-to-action/call-to-action.component'
import { CarouselBlock } from '@/modules/pages/blocks/carousel/components/carousel-block/carousel-block.component'
import { ContentBlock } from '@/modules/pages/blocks/content/components/content/content.component'
import { FormBlock } from '@/modules/pages/blocks/form/components/form-block/form-block.component.client'
import { InstagramFeedBlock } from '@/modules/pages/blocks/instagram-feed/components/instagram-feed-block/instagram-feed-block.component'
import { MediaBlock } from '@/modules/pages/blocks/media-block/components/media-block/media-block.component'
import { SocialSellingBlockComponent } from '@/modules/pages/blocks/social-selling/components/social-selling.component'
import { ThreeItemGridBlock } from '@/modules/pages/blocks/three-item-grid/components/three-item-grid.component'
import { toKebabCase } from '@/shared/utils/to-kebab-case.util'
import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'

const blockComponents = {
  archive: ArchiveBlock,
  banner: BannerBlock,
  carousel: CarouselBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  instagramFeed: InstagramFeedBlock,
  mediaBlock: MediaBlock,
  socialSelling: SocialSellingBlockComponent,
  threeItemGrid: ThreeItemGridBlock,
}

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
}> = (props) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockName, blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              return (
                <div className="my-16" key={index}>
                  {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                  {/* @ts-ignore - weird type mismatch here */}
                  <Block id={toKebabCase(blockName!)} {...block} />
                </div>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
