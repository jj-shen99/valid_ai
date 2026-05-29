import { useEffect, useRef, useState, useCallback } from 'react'
import { runAnalysis } from '../modules/analysisEngine'
import { attachAutoFixes } from '../utils/autoFixer'

/**
 * Hook for real-time debounced analysis.
 * Runs analysis after the user stops typing for `delay` ms.
 */
export function useRealtimeAnalysis(code, language, modules, { enabled = false, delay = 1500 } = {}) {
  const [findings, setFindings] = useState([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const timerRef = useRef(null)
  const abortRef = useRef(0)

  const cancel = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    abortRef.current++
  }, [])

  useEffect(() => {
    if (!enabled || !code?.trim() || modules.length === 0) {
      setFindings([])
      return
    }

    cancel()
    const runId = ++abortRef.current

    timerRef.current = setTimeout(async () => {
      setIsAnalyzing(true)
      try {
        // Only run fast modules (skip aiReview)
        const fastModules = modules.filter(m => m !== 'aiReview')
        if (fastModules.length === 0) return
        const raw = await runAnalysis(code, language, fastModules)
        // Check if this run is still current
        if (abortRef.current !== runId) return
        setFindings(attachAutoFixes(raw, code))
      } catch {
        // Silently fail for realtime
      } finally {
        if (abortRef.current === runId) setIsAnalyzing(false)
      }
    }, delay)

    return cancel
  }, [code, language, modules.join(','), enabled, delay])

  return { findings, isAnalyzing, cancel }
}
