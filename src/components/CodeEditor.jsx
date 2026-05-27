import React, { useEffect, useRef } from 'react'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'

const loadLanguage = async (lang) => {
  switch (lang) {
    case 'python': {
      const { python } = await import('@codemirror/lang-python')
      return python()
    }
    case 'javascript': {
      const { javascript } = await import('@codemirror/lang-javascript')
      return javascript()
    }
    case 'typescript': {
      const { javascript } = await import('@codemirror/lang-javascript')
      return javascript({ typescript: true })
    }
    case 'java': {
      const { java } = await import('@codemirror/lang-java')
      return java()
    }
    case 'go': {
      const { go } = await import('@codemirror/lang-go')
      return go()
    }
    case 'csharp': {
      const { cpp } = await import('@codemirror/lang-cpp')
      return cpp()
    }
    default: {
      const { python } = await import('@codemirror/lang-python')
      return python()
    }
  }
}

export default function CodeEditor({ value, onChange, language }) {
  const editorRef = useRef(null)
  const viewRef = useRef(null)

  useEffect(() => {
    if (!editorRef.current) return
    let destroyed = false

    loadLanguage(language).then((langExtension) => {
      if (destroyed || !editorRef.current) return

      const state = EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          langExtension,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChange(update.state.doc.toString())
            }
          }),
        ],
      })

      const view = new EditorView({
        state,
        parent: editorRef.current,
      })

      viewRef.current = view
    })

    return () => {
      destroyed = true
      if (viewRef.current) viewRef.current.destroy()
    }
  }, [language, onChange])

  useEffect(() => {
    if (viewRef.current && viewRef.current.state.doc.toString() !== value) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: value,
        },
      })
    }
  }, [value])

  return (
    <div
      ref={editorRef}
      className="border border-gray-300 rounded-lg overflow-hidden bg-white"
      style={{ height: '400px' }}
    />
  )
}
