import { RichText } from '@/modules/pages/components/rich-text/rich-text.component'
import React from 'react'

import { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { Width } from '../width/width.component'

export const Message: React.FC<{ message: SerializedEditorState }> = ({ message }) => {
  return (
    <Width className="my-12" width="100">
      {message && <RichText data={message} />}
    </Width>
  )
}
