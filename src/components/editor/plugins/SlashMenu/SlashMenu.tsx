import { useEffect, useRef } from 'react'
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

  useEffect(() => {
    const selection = window.getSelection()
    if (!selection || !selection.rangeCount) return

    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()

    if (ref.current) {
      ref.current.style.top = `${rect.bottom - rect.height + 3}px`
      ref.current.style.left = `${rect.left + 8}px`
    }
  }, [query])

  return createPortal(
    <div ref={ref} className="absolute -top-4 left-2 bg-white rounded-sm z-100 border-[1px] border-gray-200 min-w-[200px]">
      {options.map((opt) => (
        <div
          key={opt.label}
          className={`p-2 cursor-pointer rounded text-sm m-1 hover:bg-gray-50
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
