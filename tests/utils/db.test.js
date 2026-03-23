import { describe, it, expect, beforeEach } from 'vitest'
import {
  addSubmission,
  getAllSubmissions,
  addFindings,
  getFindingsBySubmission,
  getAllFindings,
  setSetting,
  getSetting,
  clearAllData,
  getStats,
} from '../../src/utils/db'

beforeEach(async () => {
  await clearAllData()
})

describe('submissions', () => {
  it('adds and retrieves a submission', async () => {
    const sub = { code: 'const x = 1', language: 'javascript', score: 85, timestamp: new Date().toISOString() }
    const id = await addSubmission(sub)
    expect(id).toBeDefined()

    const all = await getAllSubmissions()
    expect(all.length).toBe(1)
    expect(all[0].code).toBe('const x = 1')
    expect(all[0].language).toBe('javascript')
    expect(all[0].score).toBe(85)
  })

  it('returns submissions sorted by timestamp descending', async () => {
    await addSubmission({ code: 'first', timestamp: '2024-01-01T00:00:00Z' })
    await addSubmission({ code: 'second', timestamp: '2024-06-01T00:00:00Z' })
    await addSubmission({ code: 'third', timestamp: '2024-12-01T00:00:00Z' })

    const all = await getAllSubmissions()
    expect(all[0].code).toBe('third')
    expect(all[2].code).toBe('first')
  })

  it('handles multiple submissions', async () => {
    for (let i = 0; i < 5; i++) {
      await addSubmission({ code: `code_${i}`, language: 'python', timestamp: new Date().toISOString() })
    }
    const all = await getAllSubmissions()
    expect(all.length).toBe(5)
  })
})

describe('findings', () => {
  it('adds findings linked to a submission', async () => {
    const subId = await addSubmission({ code: 'x', timestamp: new Date().toISOString() })
    const findings = [
      { severity: 'Critical', category: 'SQL Injection', module: 'security' },
      { severity: 'High', category: 'Weak crypto', module: 'security' },
    ]
    await addFindings(findings, subId)

    const retrieved = await getFindingsBySubmission(subId)
    expect(retrieved.length).toBe(2)
    expect(retrieved[0].submissionId).toBe(subId)
  })

  it('retrieves all findings', async () => {
    const subId = await addSubmission({ code: 'x', timestamp: new Date().toISOString() })
    await addFindings([{ severity: 'Info', module: 'test' }], subId)
    await addFindings([{ severity: 'High', module: 'test2' }], subId)

    const all = await getAllFindings()
    expect(all.length).toBe(2)
  })

  it('getFindingsBySubmission returns empty for unknown id', async () => {
    const findings = await getFindingsBySubmission(99999)
    expect(findings).toEqual([])
  })
})

describe('settings', () => {
  it('sets and gets a setting', async () => {
    await setSetting('theme', 'dark')
    const val = await getSetting('theme')
    expect(val).toBe('dark')
  })

  it('returns null for unknown setting', async () => {
    const val = await getSetting('nonexistent')
    expect(val).toBeNull()
  })

  it('overwrites existing setting', async () => {
    await setSetting('theme', 'dark')
    await setSetting('theme', 'light')
    const val = await getSetting('theme')
    expect(val).toBe('light')
  })
})

describe('clearAllData', () => {
  it('clears submissions and findings', async () => {
    await addSubmission({ code: 'x', timestamp: new Date().toISOString() })
    await addFindings([{ severity: 'Info', module: 'test' }], 1)

    await clearAllData()

    const subs = await getAllSubmissions()
    const finds = await getAllFindings()
    expect(subs).toEqual([])
    expect(finds).toEqual([])
  })
})

describe('getStats', () => {
  it('returns aggregate statistics', async () => {
    const subId = await addSubmission({ code: 'x', score: 80, timestamp: new Date().toISOString() })
    await addFindings([
      { severity: 'Critical', module: 'sec' },
      { severity: 'High', module: 'sec' },
      { severity: 'Medium', module: 'fm' },
      { severity: 'Info', module: 'fm' },
    ], subId)

    const stats = await getStats()
    expect(stats.totalSubmissions).toBe(1)
    expect(stats.totalFindings).toBe(4)
    expect(stats.criticalCount).toBe(1)
    expect(stats.highCount).toBe(1)
    expect(stats.mediumCount).toBe(1)
    expect(stats.infoCount).toBe(1)
    expect(stats.avgScore).toBe(80)
  })

  it('returns zero stats when empty', async () => {
    const stats = await getStats()
    expect(stats.totalSubmissions).toBe(0)
    expect(stats.totalFindings).toBe(0)
    expect(stats.avgScore).toBe(0)
  })
})
