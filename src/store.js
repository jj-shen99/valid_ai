import { create } from 'zustand'
import * as db from './utils/db'
import { encrypt, decrypt } from './utils/crypto'

export const useStore = create((set, get) => ({
  code: '',
  setCode: (code) => set({ code }),

  prompt: '',
  setPrompt: (prompt) => set({ prompt }),

  language: 'python',
  setLanguage: (language) => set({ language }),

  selectedModules: ['failureMode', 'security', 'hallucination'],
  setSelectedModules: (modules) => set({ selectedModules: modules }),

  isRunning: false,
  setIsRunning: (running) => set({ isRunning: running }),

  findings: [],
  setFindings: (findings) => set({ findings }),
  addFinding: (finding) => set((state) => ({ findings: [...state.findings, finding] })),
  clearFindings: () => set({ findings: [] }),

  moduleProgress: {},
  setModuleProgress: (progress) => set({ moduleProgress: progress }),
  updateModuleProgress: (moduleName, status) => set((state) => ({
    moduleProgress: { ...state.moduleProgress, [moduleName]: status }
  })),

  submissions: [],
  addSubmission: async (submission) => {
    const id = await db.addSubmission(submission).catch(() => null)
    const enriched = { ...submission, id: id || Date.now() }
    set((state) => ({ submissions: [enriched, ...state.submissions] }))
    return enriched
  },

  persistFindings: async (findings, submissionId) => {
    await db.addFindings(findings, submissionId).catch(() => {})
  },

  loadFromDB: async () => {
    try {
      const submissions = await db.getAllSubmissions()
      const findings = await db.getAllFindings()
      set({ submissions, findings })
    } catch (e) {
      console.warn('Failed to load from IndexedDB:', e)
    }
  },

  clearAllData: async () => {
    await db.clearAllData().catch(() => {})
    set({ submissions: [], findings: [] })
  },

  githubToken: '',
  setGithubToken: async (token) => {
    const encrypted = await encrypt(token)
    localStorage.setItem('githubToken_enc', encrypted)
    localStorage.removeItem('githubToken')
    set({ githubToken: token })
  },

  apiKey: '',
  setApiKey: async (key) => {
    const encrypted = await encrypt(key)
    localStorage.setItem('claudeApiKey_enc', encrypted)
    localStorage.removeItem('claudeApiKey')
    set({ apiKey: key })
  },

  loadSecrets: async () => {
    const ghEnc = localStorage.getItem('githubToken_enc') || ''
    const apiEnc = localStorage.getItem('claudeApiKey_enc') || ''
    const ghPlain = localStorage.getItem('githubToken') || ''
    const apiPlain = localStorage.getItem('claudeApiKey') || ''
    const githubToken = ghEnc ? await decrypt(ghEnc) : ghPlain
    const apiKey = apiEnc ? await decrypt(apiEnc) : apiPlain
    set({ githubToken, apiKey })
  },

  notifications: [],
  addNotification: (msg, type = 'info') => {
    const id = Date.now()
    set((state) => ({
      notifications: [...state.notifications, { id, msg, type }]
    }))
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      }))
    }, 4000)
  },
}))
