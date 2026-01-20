import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { $createTextNode, $getSelection, $isRangeSelection, $isTextNode, LexicalEditor } from 'lexical'
import { $createCodeNode } from '@lexical/code'
import { $createLinkNode } from '@lexical/link'

function insertCodeBlock(language = 'javascript') {
  removeSlashTrigger()

  const selection = $getSelection()
  if (!$isRangeSelection(selection)) return

  const codeNode = $createCodeNode(language)

  selection.insertNodes([codeNode])
}

function removeSlashTrigger() {
  const selection = $getSelection()
  if (!$isRangeSelection(selection)) return
  if (!selection.isCollapsed()) return

  const anchor = selection.anchor
  const node = anchor.getNode()

  if (!$isTextNode(node)) return

  const text = node.getTextContent()
  const offset = anchor.offset

  if (offset > 0 && text[offset - 1] === '\\') {
    node.spliceText(offset - 1, 1, '', true)
  }
}


function insertLink() {
  removeSlashTrigger()
  const link = $createLinkNode('https://')
  link.append($createTextNode('link'))
  $getSelection()?.insertNodes([link])
}


interface Props {
  editor: LexicalEditor
  query: string
}
export function SlashMenu({ query, editor }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const options = [
    { label: 'Python', action: () => insertCodeBlock('python') },
    { label: 'JavaScript', action: () => insertCodeBlock() },
    { label: 'Bash', action: () => insertCodeBlock('bash') },
    { label: 'Link', action: insertLink },
  ].filter(o =>
    o.label.toLowerCase().includes(query.toLowerCase())
  )
  const [highlightIndex, setHighlightIndex] = useState(0)

  useEffect(() => {
    const selection = window.getSelection()
    if (!selection || !selection.rangeCount) return

    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()

    if (ref.current) {
      ref.current.style.top = `${rect.bottom - rect.height + 3}px`
      ref.current.style.left = `${rect.left + 4}px`
    }
  }, [query])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!options.length) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setHighlightIndex(prev => (prev + 1) % options.length)
          break
        case 'ArrowUp':
          e.preventDefault()
          setHighlightIndex(prev => (prev - 1 + options.length) % options.length)
          break
        case 'Enter':
          break
        case 'Tab':
          e.preventDefault()
          const selected = options[highlightIndex]
          if (selected) {
            editor.update(() => selected.action())
          }
          break
        case 'Escape':
          e.preventDefault()
          break
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [highlightIndex, options])

  return createPortal(
    <div ref={ref} className="absolute -top-4 left-2 bg-white rounded-sm z-100 border-[1px] border-gray-200 min-w-[200px]">
      {options.map((opt, idx) => (
        <div
          key={opt.label}
          className={`p-2 cursor-pointer rounded text-gray-600 text-sm m-1 hover:bg-gray-50 ${idx === highlightIndex ? 'bg-gray-100 text-blue-900' : ''
            }`}
          onClick={() => editor.update(() => opt.action())}
        >
          {opt.label}
        </div>
      ))}
    </div>,
    document.body
  )
}
