import React, { useEffect } from 'react'
import { X, Keyboard } from 'lucide-react'
import { SHORTCUT_MAP } from '../hooks/useKeyboardShortcuts'

export default function ShortcutsModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Keyboard size={16} />
            Keyboard Shortcuts
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>

        <div className="px-5 py-4 space-y-2">
          {SHORTCUT_MAP.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-1.5">
              <span className="text-sm text-gray-700">{s.description}</span>
              <kbd className="text-xs font-mono bg-gray-100 border border-gray-300 rounded px-2 py-0.5 text-gray-600">{s.label}</kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
