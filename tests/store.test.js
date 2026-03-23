import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from '../src/store'

beforeEach(() => {
  localStorage.clear()
  useStore.setState({
    code: '',
    prompt: '',
    language: 'python',
    selectedModules: ['failureMode', 'security', 'hallucination'],
    isRunning: false,
    findings: [],
    moduleProgress: {},
    submissions: [],
    notifications: [],
    githubToken: '',
    apiKey: '',
  })
})

describe('useStore', () => {
  describe('code state', () => {
    it('sets and gets code', () => {
      useStore.getState().setCode('const x = 1')
      expect(useStore.getState().code).toBe('const x = 1')
    })

    it('sets and gets prompt', () => {
      useStore.getState().setPrompt('Write a function')
      expect(useStore.getState().prompt).toBe('Write a function')
    })

    it('sets and gets language', () => {
      useStore.getState().setLanguage('javascript')
      expect(useStore.getState().language).toBe('javascript')
    })
  })

  describe('modules', () => {
    it('sets selected modules', () => {
      useStore.getState().setSelectedModules(['security', 'oracle'])
      expect(useStore.getState().selectedModules).toEqual(['security', 'oracle'])
    })

    it('has default modules', () => {
      expect(useStore.getState().selectedModules).toContain('failureMode')
      expect(useStore.getState().selectedModules).toContain('security')
      expect(useStore.getState().selectedModules).toContain('hallucination')
    })
  })

  describe('findings', () => {
    it('adds a finding', () => {
      const finding = { id: 'f1', severity: 'High', category: 'Test' }
      useStore.getState().addFinding(finding)
      expect(useStore.getState().findings).toHaveLength(1)
      expect(useStore.getState().findings[0]).toEqual(finding)
    })

    it('clears findings', () => {
      useStore.getState().addFinding({ id: 'f1', severity: 'High' })
      useStore.getState().addFinding({ id: 'f2', severity: 'Low' })
      expect(useStore.getState().findings).toHaveLength(2)

      useStore.getState().clearFindings()
      expect(useStore.getState().findings).toEqual([])
    })

    it('sets findings array', () => {
      const findings = [{ id: 'f1' }, { id: 'f2' }]
      useStore.getState().setFindings(findings)
      expect(useStore.getState().findings).toEqual(findings)
    })
  })

  describe('module progress', () => {
    it('updates module progress', () => {
      useStore.getState().updateModuleProgress('failureMode', 'running')
      expect(useStore.getState().moduleProgress.failureMode).toBe('running')
    })

    it('sets module progress object', () => {
      const progress = { failureMode: 'complete', security: 'running' }
      useStore.getState().setModuleProgress(progress)
      expect(useStore.getState().moduleProgress).toEqual(progress)
    })
  })

  describe('isRunning', () => {
    it('sets running state', () => {
      expect(useStore.getState().isRunning).toBe(false)
      useStore.getState().setIsRunning(true)
      expect(useStore.getState().isRunning).toBe(true)
    })
  })

  describe('submissions', () => {
    it('adds a submission and returns enriched object', async () => {
      const sub = { code: 'x = 1', language: 'python', score: 90, timestamp: new Date().toISOString() }
      const result = await useStore.getState().addSubmission(sub)
      expect(result.id).toBeDefined()
      expect(useStore.getState().submissions).toHaveLength(1)
    })
  })

  describe('notifications', () => {
    it('adds a notification', () => {
      useStore.getState().addNotification('Test message', 'info')
      expect(useStore.getState().notifications).toHaveLength(1)
      expect(useStore.getState().notifications[0].msg).toBe('Test message')
      expect(useStore.getState().notifications[0].type).toBe('info')
    })
  })

  describe('secrets', () => {
    it('sets and encrypts github token', async () => {
      await useStore.getState().setGithubToken('ghp_test123')
      expect(useStore.getState().githubToken).toBe('ghp_test123')
      expect(localStorage.getItem('githubToken_enc')).toBeTruthy()
      expect(localStorage.getItem('githubToken_enc')).not.toBe('ghp_test123')
    })

    it('sets and encrypts api key', async () => {
      await useStore.getState().setApiKey('sk-ant-test')
      expect(useStore.getState().apiKey).toBe('sk-ant-test')
      expect(localStorage.getItem('claudeApiKey_enc')).toBeTruthy()
    })

    it('loads secrets from encrypted storage', async () => {
      await useStore.getState().setGithubToken('ghp_roundtrip')
      await useStore.getState().setApiKey('sk-roundtrip')

      // Reset in-memory state
      useStore.setState({ githubToken: '', apiKey: '' })
      expect(useStore.getState().githubToken).toBe('')

      await useStore.getState().loadSecrets()
      expect(useStore.getState().githubToken).toBe('ghp_roundtrip')
      expect(useStore.getState().apiKey).toBe('sk-roundtrip')
    })
  })
})
