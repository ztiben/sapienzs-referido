import type { BlockConverters } from '@/shared/components/rich-text/rich-text.component'

import { BannerBlock } from '@/modules/pages/blocks/banner/components/banner/banner.component'
import { CallToActionBlock } from '@/modules/pages/blocks/call-to-action/components/call-to-action/call-to-action.component'
import { CodeBlock } from '@/modules/pages/blocks/code/components/code-block/code-block.component'
import { MediaBlock } from '@/modules/pages/blocks/media-block/components/media-block/media-block.component'

/**
 * The CMS block converters for RichText. Lives in `pages` because these block
 * components are pages-domain; injected into the shared `RichText` via props.
 */
export const pageBlockConverters: BlockConverters = {
  banner: ({ node }) => (
    <BannerBlock
      className="col-start-2 mb-4"
      {...(node.fields as unknown as React.ComponentProps<typeof BannerBlock>)}
    />
  ),
  mediaBlock: ({ node }) => (
    <MediaBlock
      className="col-start-1 col-span-3"
      imgClassName="m-0"
      {...(node.fields as unknown as React.ComponentProps<typeof MediaBlock>)}
      captionClassName="mx-auto max-w-3xl"
      enableGutter={false}
      disableInnerContainer={true}
    />
  ),
  code: ({ node }) => (
    <CodeBlock
      className="col-start-2"
      {...(node.fields as unknown as React.ComponentProps<typeof CodeBlock>)}
    />
  ),
  cta: ({ node }) => (
    <CallToActionBlock {...(node.fields as unknown as React.ComponentProps<typeof CallToActionBlock>)} />
  ),
}
