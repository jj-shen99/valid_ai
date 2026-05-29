import { useEffect, useCallback } from 'react'

/**
 * Global keyboard shortcut manager.
 *
 * Registers shortcuts and invokes callbacks on match.
 * Supports Ctrl/Cmd + key combos, and plain keys.
 */
export function useKeyboardShortcuts(shortcuts) {
  const handler = useCallback((e) => {
    // Don't trigger inside <input>, <textarea>, <select>
    const tag = e.target.tagName
    const isEditable = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable

    for (const s of shortcuts) {
      const modKey = e.ctrlKey || e.metaKey
      const modMatch = s.mod ? modKey : !modKey
      const shiftMatch = s.shift ? e.shiftKey : true
      const keyMatch = e.key.toLowerCase() === s.key.toLowerCase()

      if (keyMatch && modMatch && shiftMatch) {
        // Allow mod shortcuts even in editable fields, but block plain key shortcuts
        if (!s.mod && isEditable) continue
        e.preventDefault()
        s.action()
        return
      }
    }
  }, [shortcuts])

  useEffect(() => {
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handler])
}

export const SHORTCUT_MAP = [
  { key: 'Enter', mod: true, label: '⌘/Ctrl+Enter', description: 'Run analysis' },
  { key: 'k', mod: true, label: '⌘/Ctrl+K', description: 'Open command palette' },
  { key: '1', mod: true, label: '⌘/Ctrl+1', description: 'Go to Dashboard' },
  { key: '2', mod: true, label: '⌘/Ctrl+2', description: 'Go to Submit Code' },
  { key: '3', mod: true, label: '⌘/Ctrl+3', description: 'Go to GitHub Analysis' },
  { key: '4', mod: true, label: '⌘/Ctrl+4', description: 'Go to Analysis Results' },
  { key: '5', mod: true, label: '⌘/Ctrl+5', description: 'Go to Trends' },
  { key: '?', mod: false, shift: true, label: 'Shift+?', description: 'Show keyboard shortcuts' },
]
