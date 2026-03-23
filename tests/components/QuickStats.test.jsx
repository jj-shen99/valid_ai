import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import QuickStats from '../../src/components/QuickStats'

describe('QuickStats', () => {
  it('renders 100% score with no findings', () => {
    render(<QuickStats findings={[]} />)
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('renders severity counts correctly', () => {
    const findings = [
      { severity: 'Critical', id: '1' },
      { severity: 'Critical', id: '2' },
      { severity: 'High', id: '3' },
      { severity: 'Medium', id: '4' },
      { severity: 'Info', id: '5' },
    ]
    const { container } = render(<QuickStats findings={findings} />)
    // The grid has 4 cards; card[1]=Critical, card[2]=High, card[3]=Medium (Info removed)
    const cards = container.querySelectorAll('.grid > div')
    expect(cards[1].textContent).toContain('2') // Critical = 2
    expect(cards[2].textContent).toContain('1') // High = 1
    expect(cards[3].textContent).toContain('1') // Medium = 1
  })

  it('calculates quality score based on findings', () => {
    const findings = [
      { severity: 'Critical', id: '1' },
      { severity: 'High', id: '2' },
    ]
    const { container } = render(<QuickStats findings={findings} />)
    // weighted = 10 + 5 = 15, avgPenalty = 15/2 = 7.5, score = 100 - 75 = 25
    const cards = container.querySelectorAll('.grid > div')
    expect(cards[0].textContent).toContain('25%')
  })

  it('renders all stat labels', () => {
    render(<QuickStats findings={[]} />)
    expect(screen.getByText('Quality Score')).toBeInTheDocument()
    expect(screen.getByText('Critical')).toBeInTheDocument()
    expect(screen.getByText('High')).toBeInTheDocument()
    expect(screen.getByText('Medium')).toBeInTheDocument()
  })
})
