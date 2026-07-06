import {
  RichText as SharedRichText,
} from '@/shared/components/rich-text/rich-text.component'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import React from 'react'

import { pageBlockConverters } from './block-converters'

type Props = {
  data: SerializedEditorState
  enableGutter?: boolean
  enableProse?: boolean
} & React.HTMLAttributes<HTMLDivElement>

/**
 * RichText for CMS page content — injects the pages CMS block converters into
 * the shared, block-agnostic RichText.
 */
export const RichText: React.FC<Props> = (props) => (
  <SharedRichText {...props} blockConverters={pageBlockConverters} />
)
