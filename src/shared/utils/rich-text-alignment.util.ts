export function getRichTextAlignment(richText: unknown): string {
  const children = (richText as { root?: { children?: { format?: string }[] } })?.root?.children
  if (!children?.length) return 'left'
  const lastChild = children[children.length - 1]
  return lastChild?.format || 'left'
}

export const alignToFlex: Record<string, string> = {
  left: 'justify-start',
  start: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
  end: 'justify-end',
}
