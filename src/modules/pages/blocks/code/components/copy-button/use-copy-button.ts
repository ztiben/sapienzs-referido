import { useState } from 'react'

export const useCopyButton = (code: string) => {
  const [text, setText] = useState('Copy')

  const copy = async () => {
    await navigator.clipboard.writeText(code)
    if (text === 'Copy') {
      setText('Copied!')
      setTimeout(() => setText('Copy'), 1000)
    }
  }

  return { text, copy }
}
