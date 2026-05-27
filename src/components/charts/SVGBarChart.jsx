import React, { useMemo } from 'react'

const DEFAULT_COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4']

export default function SVGBarChart({ data, dataKey = 'count', nameKey = 'name', layout = 'vertical', colors = DEFAULT_COLORS, width = 560, height = 260 }) {
  const padding = layout === 'vertical'
    ? { top: 10, right: 30, bottom: 10, left: 140 }
    : { top: 10, right: 10, bottom: 40, left: 40 }

  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const maxVal = useMemo(() => Math.max(...data.map(d => d[dataKey] || 0), 1), [data, dataKey])

  if (!data || data.length === 0) return <p className="text-sm text-gray-400 text-center py-8">No data</p>

  if (layout === 'vertical') {
    const barH = Math.min(28, (chartH - (data.length - 1) * 4) / data.length)
    const gap = 4

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: height }}>
        {data.map((d, i) => {
          const y = padding.top + i * (barH + gap)
          const w = Math.max(4, (d[dataKey] / maxVal) * chartW)
          const color = colors[i % colors.length]
          return (
            <g key={i}>
              <text x={padding.left - 8} y={y + barH / 2 + 4} textAnchor="end" fontSize={11} fill="#374151">
                {(d[nameKey] || '').length > 18 ? (d[nameKey] || '').slice(0, 16) + '…' : d[nameKey]}
              </text>
              <rect x={padding.left} y={y} width={w} height={barH} rx={4} fill={color} opacity={0.85}>
                <title>{d[nameKey]}: {d[dataKey]}</title>
              </rect>
              <text x={padding.left + w + 6} y={y + barH / 2 + 4} fontSize={11} fill="#6b7280">{d[dataKey]}</text>
            </g>
          )
        })}
      </svg>
    )
  }

  // Vertical bars (layout !== 'vertical')
  const barW = Math.min(40, (chartW - (data.length - 1) * 4) / data.length)
  const gap = 4

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: height }}>
      {data.map((d, i) => {
        const x = padding.left + i * (barW + gap)
        const h = Math.max(2, (d[dataKey] / maxVal) * chartH)
        const y = padding.top + chartH - h
        const color = colors[i % colors.length]
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={h} rx={3} fill={color} opacity={0.85}>
              <title>{d[nameKey]}: {d[dataKey]}</title>
            </rect>
            <text x={x + barW / 2} y={height - 6} textAnchor="middle" fontSize={9} fill="#9ca3af">{(d[nameKey] || '').length > 8 ? (d[nameKey] || '').slice(0, 6) + '…' : d[nameKey]}</text>
          </g>
        )
      })}
    </svg>
  )
}
