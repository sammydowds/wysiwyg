import { useEffect, useState } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
} from 'lexical'
import { SlashMenu } from './SlashMenu'

export function SlashCommandPlugin() {
  const [editor] = useLexicalComposerContext()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) {
          setOpen(false)
          return
        }

        const node = selection.anchor.getNode()
        if (!$isTextNode(node)) {
          setOpen(false)
          return
        }

        const text = node.getTextContent()
        const offset = selection.anchor.offset
        const beforeCursor = text.slice(0, offset)

        const match = beforeCursor.match(/\\([a-z]*)$/)

        if (match) {
          setOpen(true)
          setQuery(match[1])
        } else {
          setOpen(false)
        }
      })
    })
  }, [editor])

  if (!open) return null

  return <div className='relative'>
    <SlashMenu query={query} editor={editor} />
  </div>
}
