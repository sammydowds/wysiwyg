import { useEffect, useRef } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useFile, useUpdateFile } from '../../../api/html'
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html'
import { $getRoot } from 'lexical'
import { useDebouncedCallback } from 'use-debounce'

interface Props {
  fileName: string
}

export const SyncPlugin = ({ fileName }: Props) => {
  const [editor] = useLexicalComposerContext()
  const { data: file } = useFile(fileName)
  const { content } = file ?? { content: null }
  const initializedRef = useRef(false)
  const { mutate } = useUpdateFile()

  const debouncedSave = useDebouncedCallback((editorState) => {
    editorState.read(() => {
      const htmlString = $generateHtmlFromNodes(editor);
      console.log(htmlString)
      mutate({ filename: fileName, content: htmlString })
    });
  }, 1000);

  useEffect(() => {
    if (!content || initializedRef.current) return;

    editor.update(() => {
      const root = $getRoot();
      root.clear();

      const parser = new DOMParser();
      const dom = parser.parseFromString(`<body>${content}</body>`, 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom.body);

      root.append(...nodes);
      initializedRef.current = true;
    });
  }, [content, editor]);

  useEffect(() => {
    if (!editor) return;

    const unregister = editor.registerUpdateListener(({ editorState, dirtyElements, dirtyLeaves }) => {
      if (!initializedRef.current) return;
      const hasChanges = dirtyElements.size > 0 || dirtyLeaves.size > 0;
      if (hasChanges) {
        debouncedSave(editorState);
      }
    });

    return () => unregister();
  }, [editor, debouncedSave]);

  return null;
}

