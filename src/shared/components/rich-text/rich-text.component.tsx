import { DefaultNodeTypes, SerializedBlockNode } from '@payloadcms/richtext-lexical'
import { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import {
  JSXConvertersFunction,
  RichText as RichTextWithoutBlocks,
} from '@payloadcms/richtext-lexical/react'
import NextLink from 'next/link'
import React from 'react'

import { cn } from '@/shared/utils/cn.util'

type NodeTypes = DefaultNodeTypes | SerializedBlockNode

/**
 * Block converters are injected by the caller (the `pages` module owns the CMS
 * block components). `RichText` itself stays block-agnostic so `shared/` never
 * depends on a module.
 */
export type BlockConverters = Record<
  string,
  (args: { node: SerializedBlockNode }) => React.ReactNode
>

const buildConverters =
  (blockConverters?: BlockConverters): JSXConvertersFunction<NodeTypes> =>
  ({ defaultConverters }) => ({
    ...defaultConverters,
    link: ({ node, nodesToJSX }) => {
      const children = nodesToJSX({ nodes: node.children })
      const rel = node.fields.newTab ? 'noopener noreferrer' : undefined
      const target = node.fields.newTab ? '_blank' : undefined

      const { linkType, doc, url } = node.fields
      if (
        linkType === 'internal' &&
        doc &&
        typeof doc.value === 'object' &&
        (doc.value as Record<string, unknown>).slug
      ) {
        const slug = (doc.value as Record<string, unknown>).slug as string
        const href = `${doc.relationTo !== 'pages' ? `/${doc.relationTo}` : ''}/${slug}`
        return (
          <NextLink href={href} rel={rel} target={target}>
            {children}
          </NextLink>
        )
      }

      return (
        <a href={url ?? ''} rel={rel} target={target}>
          {children}
        </a>
      )
    },
    ...(blockConverters ? { blocks: blockConverters } : {}),
  })

type Props = {
  data: SerializedEditorState
  enableGutter?: boolean
  enableProse?: boolean
  blockConverters?: BlockConverters
} & React.HTMLAttributes<HTMLDivElement>

export const RichText: React.FC<Props> = (props) => {
  const {
    className,
    enableProse = true,
    enableGutter = true,
    blockConverters,
    ...rest
  } = props
  return (
    <RichTextWithoutBlocks
      converters={buildConverters(blockConverters)}
      className={cn(
        {
          'container ': enableGutter,
          'max-w-none': !enableGutter,
          'mx-auto prose md:prose-md': enableProse,
        },
        className,
      )}
      {...rest}
    />
  )
}
