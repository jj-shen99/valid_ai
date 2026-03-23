import '@testing-library/jest-dom'
import 'fake-indexeddb/auto'

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value) },
    removeItem: (key) => { delete store[key] },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

// Mock crypto.subtle for tests (simplified)
if (!globalThis.crypto?.subtle) {
  const cryptoModule = await import('crypto')
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      subtle: cryptoModule.webcrypto?.subtle || cryptoModule.default?.webcrypto?.subtle,
      getRandomValues: (arr) => {
        const bytes = cryptoModule.randomBytes(arr.length)
        arr.set(bytes)
        return arr
      },
    },
  })
}
