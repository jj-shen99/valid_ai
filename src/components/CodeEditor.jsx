import React, { useEffect, useRef } from 'react'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { python } from '@codemirror/lang-python'
import { javascript } from '@codemirror/lang-javascript'
import { java } from '@codemirror/lang-java'
import { go } from '@codemirror/lang-go'
import { cpp } from '@codemirror/lang-cpp'

const languageMap = {
  python: python(),
  javascript: javascript(),
  typescript: javascript({ typescript: true }),
  java: java(),
  go: go(),
  csharp: cpp(),
}

export default function CodeEditor({ value, onChange, language }) {
  const editorRef = useRef(null)
  const viewRef = useRef(null)

  useEffect(() => {
    if (!editorRef.current) return

    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        languageMap[language] || python(),
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

    return () => {
      view.destroy()
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
