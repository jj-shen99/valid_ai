import { useState, useEffect, useCallback } from 'react'

const VALID_PAGES = ['dashboard', 'submit', 'github', 'analysis', 'trends', 'settings']
const DEFAULT_PAGE = 'dashboard'

function getPageFromHash() {
  const hash = window.location.hash.replace('#/', '').replace('#', '')
  return VALID_PAGES.includes(hash) ? hash : DEFAULT_PAGE
}

export function useHashRouter() {
  const [page, setPageState] = useState(getPageFromHash)

  useEffect(() => {
    const onHashChange = () => setPageState(getPageFromHash())
    window.addEventListener('hashchange', onHashChange)
    // Set initial hash if missing
    if (!window.location.hash) {
      window.location.hash = `#/${DEFAULT_PAGE}`
    }
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = useCallback((newPage) => {
    if (VALID_PAGES.includes(newPage)) {
      window.location.hash = `#/${newPage}`
    }
  }, [])

  return { page, navigate }
}
