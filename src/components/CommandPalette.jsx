import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Search, Home, FileText, Github, BarChart3, TrendingUp, Settings, Moon, Sun, Keyboard, X } from 'lucide-react'

const COMMANDS = [
  { id: 'dashboard', label: 'Go to Dashboard', icon: Home, group: 'Navigation' },
  { id: 'submit', label: 'Go to Submit Code', icon: FileText, group: 'Navigation' },
  { id: 'github', label: 'Go to GitHub Analysis', icon: Github, group: 'Navigation' },
  { id: 'analysis', label: 'Go to Analysis Results', icon: BarChart3, group: 'Navigation' },
  { id: 'trends', label: 'Go to Trends', icon: TrendingUp, group: 'Navigation' },
  { id: 'settings', label: 'Go to Settings', icon: Settings, group: 'Navigation' },
  { id: 'toggle-dark', label: 'Toggle Dark Mode', icon: Moon, group: 'Actions' },
  { id: 'shortcuts', label: 'Show Keyboard Shortcuts', icon: Keyboard, group: 'Help' },
]

export default function CommandPalette({ open, onClose, onCommand }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const filtered = useMemo(() => {
    if (!query.trim()) return COMMANDS
    const q = query.toLowerCase()
    return COMMANDS.filter(c => c.label.toLowerCase().includes(q) || c.group.toLowerCase().includes(q))
  }, [query])

  const groups = useMemo(() => {
    const map = {}
    filtered.forEach(c => {
      if (!map[c.group]) map[c.group] = []
      map[c.group].push(c)
    })
    return Object.entries(map)
  }, [filtered])

  const handleSelect = (cmd) => {
    onCommand(cmd.id)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
          <Search size={18} className="text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command…"
            className="flex-1 text-sm outline-none placeholder-gray-400"
          />
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>

        <div className="max-h-72 overflow-y-auto py-2">
          {groups.length === 0 && (
            <p className="text-sm text-gray-400 px-4 py-6 text-center">No matching commands</p>
          )}
          {groups.map(([group, cmds]) => (
            <div key={group}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-4 pt-2 pb-1">{group}</p>
              {cmds.map(cmd => {
                const Icon = cmd.icon
                return (
                  <button
                    key={cmd.id}
                    onClick={() => handleSelect(cmd)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    <Icon size={16} className="flex-shrink-0" />
                    {cmd.label}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 px-4 py-2 flex items-center justify-between text-[10px] text-gray-400">
          <span>↑↓ Navigate · Enter Select · Esc Close</span>
          <span>⌘K to toggle</span>
        </div>
      </div>
    </div>
  )
}
