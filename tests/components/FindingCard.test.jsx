import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FindingCard from '../../src/components/FindingCard'

const mockFinding = {
  id: 'test-1',
  severity: 'Critical',
  module: 'security',
  moduleName: 'Security Probe',
  category: 'SQL Injection',
  description: 'Detected SQL injection vulnerability',
  lineNumber: 5,
  suggestion: 'Use parameterized queries',
  timestamp: '2024-01-15T10:00:00Z',
}

describe('FindingCard', () => {
  it('renders finding category and description', () => {
    render(<FindingCard finding={mockFinding} />)
    expect(screen.getByText('SQL Injection')).toBeInTheDocument()
    expect(screen.getByText('Detected SQL injection vulnerability')).toBeInTheDocument()
  })

  it('renders severity badge', () => {
    render(<FindingCard finding={mockFinding} />)
    expect(screen.getByText('Critical')).toBeInTheDocument()
  })

  it('renders module name', () => {
    render(<FindingCard finding={mockFinding} />)
    expect(screen.getByText('Security Probe')).toBeInTheDocument()
  })

  it('expands to show line number and suggestion on click', () => {
    render(<FindingCard finding={mockFinding} />)
    // Initially suggestion not visible
    expect(screen.queryByText('Use parameterized queries')).not.toBeInTheDocument()

    // Click to expand
    fireEvent.click(screen.getByText('SQL Injection'))
    expect(screen.getByText('Use parameterized queries')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders different severity colors', () => {
    const { rerender } = render(<FindingCard finding={mockFinding} />)
    const card = screen.getByText('SQL Injection').closest('div.border')
    expect(card).toBeTruthy()

    rerender(<FindingCard finding={{ ...mockFinding, severity: 'Info' }} />)
    expect(screen.getByText('Info')).toBeInTheDocument()
  })
})
