import { create } from 'zustand'

export const useStore = create((set) => ({
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
  addSubmission: (submission) => set((state) => ({
    submissions: [submission, ...state.submissions]
  })),
  
  apiKey: localStorage.getItem('claudeApiKey') || '',
  setApiKey: (key) => {
    localStorage.setItem('claudeApiKey', key)
    set({ apiKey: key })
  },
}))
