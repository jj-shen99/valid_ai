import { describe, it, expect } from 'vitest'
import {
  formatIssueTitle,
  formatIssueBody,
  getIssueLabels,
  buildIssueUrl,
} from '../../src/utils/githubIssueExporter'

const finding = {
  id: 'f1',
  module: 'security',
  moduleName: 'Security Probe',
  severity: 'Critical',
  category: 'SQL Injection',
  description: 'SQL injection vulnerability detected on line 10.',
  lineNumber: 10,
  suggestion: 'Use parameterized queries instead of string concatenation.',
  codeSnippet: 'db.query("SELECT * FROM users WHERE id=" + userId)',
  autoFix: { replace: '"SELECT * FROM users WHERE id=" + userId', with: '"SELECT * FROM users WHERE id = $1", [userId]' },
  timestamp: '2024-01-01T00:00:00.000Z',
}

describe('GitHub Issue Exporter', () => {
  describe('formatIssueTitle', () => {
    it('includes severity and category', () => {
      const title = formatIssueTitle(finding)
      expect(title).toContain('[ValidAI]')
      expect(title).toContain('Critical')
      expect(title).toContain('SQL Injection')
    })

    it('works with minimal finding', () => {
      const title = formatIssueTitle({ severity: 'Info', category: 'Test' })
      expect(title).toBe('[ValidAI] Info: Test')
    })
  })

  describe('formatIssueBody', () => {
    it('includes all sections', () => {
      const body = formatIssueBody(finding)
      expect(body).toContain('SQL Injection')
      expect(body).toContain('Critical')
      expect(body).toContain('Security Probe')
      expect(body).toContain('Line:** 10')
      expect(body).toContain('Description')
      expect(body).toContain('Suggestion')
      expect(body).toContain('Code Snippet')
      expect(body).toContain('Auto-Fix')
    })

    it('includes version in footer', () => {
      const body = formatIssueBody(finding, { version: '1.0.0' })
      expect(body).toContain('ValidAI v1.0.0')
    })

    it('handles finding without code snippet', () => {
      const minimal = { ...finding, codeSnippet: undefined, autoFix: undefined }
      const body = formatIssueBody(minimal)
      expect(body).not.toContain('Code Snippet')
      expect(body).not.toContain('Auto-Fix')
    })

    it('includes auto-fix diff format', () => {
      const body = formatIssueBody(finding)
      expect(body).toContain('```diff')
      expect(body).toContain('- ')
      expect(body).toContain('+ ')
    })
  })

  describe('getIssueLabels', () => {
    it('includes validai label', () => {
      expect(getIssueLabels(finding)).toContain('validai')
    })

    it('includes severity label', () => {
      expect(getIssueLabels(finding)).toContain('priority: critical')
    })

    it('includes module label', () => {
      expect(getIssueLabels(finding)).toContain('module: security')
    })

    it('maps all severity levels', () => {
      expect(getIssueLabels({ severity: 'High', module: 'a' })).toContain('priority: high')
      expect(getIssueLabels({ severity: 'Medium', module: 'a' })).toContain('priority: medium')
      expect(getIssueLabels({ severity: 'Info', module: 'a' })).toContain('priority: low')
    })
  })

  describe('buildIssueUrl', () => {
    it('returns valid GitHub URL', () => {
      const url = buildIssueUrl(finding, { owner: 'user', repo: 'project' })
      expect(url).toContain('https://github.com/user/project/issues/new')
      expect(url).toContain('title=')
      expect(url).toContain('body=')
      expect(url).toContain('labels=')
    })

    it('URL-encodes title and body', () => {
      const url = buildIssueUrl(finding, { owner: 'o', repo: 'r' })
      expect(url).not.toContain(' ')
      expect(url).toContain('%5BValidAI%5D')
    })

    it('includes label parameters', () => {
      const url = buildIssueUrl(finding, { owner: 'o', repo: 'r' })
      expect(url).toContain('labels=')
    })
  })
})
