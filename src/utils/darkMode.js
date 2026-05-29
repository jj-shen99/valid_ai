/**
 * Dark Mode Utilities
 *
 * Helpers for dark-mode-aware class generation
 * and theme state management.
 */

const STORAGE_KEY = 'validai_dark_mode'

export function getDarkModePref() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) return stored === 'true'
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  } catch {
    return false
  }
}

export function setDarkModePref(enabled) {
  try {
    localStorage.setItem(STORAGE_KEY, String(enabled))
  } catch {}
}

export function applyDarkClass(enabled) {
  if (enabled) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// Dark-aware color helper: returns appropriate class string
export function dc(lightClass, darkClass) {
  return `${lightClass} dark:${darkClass}`
}

// Severity colors with dark mode support
export const severityColorsDark = {
  Critical: {
    bg: 'bg-red-50 dark:bg-red-950',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-900 dark:text-red-200',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
  High: {
    bg: 'bg-orange-50 dark:bg-orange-950',
    border: 'border-orange-200 dark:border-orange-800',
    text: 'text-orange-900 dark:text-orange-200',
    badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  },
  Medium: {
    bg: 'bg-yellow-50 dark:bg-yellow-950',
    border: 'border-yellow-200 dark:border-yellow-800',
    text: 'text-yellow-900 dark:text-yellow-200',
    badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  },
  Info: {
    bg: 'bg-blue-50 dark:bg-blue-950',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-900 dark:text-blue-200',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
}
