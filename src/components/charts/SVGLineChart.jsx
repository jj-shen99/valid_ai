import React, { useMemo } from 'react'

const COLORS = {
  blue: '#3b82f6',
  red: '#ef4444',
  orange: '#f97316',
  green: '#22c55e',
  purple: '#8b5cf6',
  gray: '#6b7280',
}

export default function SVGLineChart({ data, lines, width = 600, height = 300, showGrid = true, showLegend = true, showTooltip = true }) {
  const padding = { top: 20, right: 20, bottom: 40, left: 50 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const { yMin, yMax, xLabels, paths, legendItems, points } = useMemo(() => {
    if (!data || data.length === 0) return { yMin: 0, yMax: 100, xLabels: [], paths: [], legendItems: [], points: [] }

    let allVals = []
    lines.forEach(l => data.forEach(d => { if (d[l.key] != null) allVals.push(d[l.key]) }))
    const mn = Math.min(...allVals, 0)
    const mx = Math.max(...allVals, 1)
    const range = mx - mn || 1

    const xLabels = data.map(d => d.name || '')
    const paths = []
    const pts = []
    const legendItems = []

    lines.forEach(line => {
      const color = COLORS[line.color] || line.color || COLORS.blue
      legendItems.push({ label: line.label || line.key, color })
      let pathD = ''
      data.forEach((d, i) => {
        if (d[line.key] == null) return
        const x = padding.left + (data.length > 1 ? (i / (data.length - 1)) * chartW : chartW / 2)
        const y = padding.top + chartH - ((d[line.key] - mn) / range) * chartH
        pathD += (pathD ? ` L${x},${y}` : `M${x},${y}`)
        pts.push({ x, y, value: d[line.key], label: line.label || line.key, color, name: d.name })
      })
      paths.push({ d: pathD, color, dashed: line.dashed })
    })

    return { yMin: mn, yMax: mx, xLabels, paths, legendItems, points: pts }
  }, [data, lines, chartW, chartH, padding.left, padding.top])

  const yTicks = useMemo(() => {
    const range = yMax - yMin || 1
    const step = Math.ceil(range / 4)
    const ticks = []
    for (let v = yMin; v <= yMax; v += step) ticks.push(v)
    if (ticks[ticks.length - 1] < yMax) ticks.push(yMax)
    return ticks
  }, [yMin, yMax])

  if (!data || data.length === 0) return <p className="text-sm text-gray-400 text-center py-8">No data</p>

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: height }}>
      {showGrid && yTicks.map(v => {
        const y = padding.top + chartH - ((v - yMin) / (yMax - yMin || 1)) * chartH
        return (
          <g key={v}>
            <line x1={padding.left} y1={y} x2={padding.left + chartW} y2={y} stroke="#f0f0f0" strokeWidth={1} />
            <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize={10} fill="#9ca3af">{Math.round(v)}</text>
          </g>
        )
      })}

      {xLabels.map((label, i) => {
        const x = padding.left + (xLabels.length > 1 ? (i / (xLabels.length - 1)) * chartW : chartW / 2)
        const show = xLabels.length <= 12 || i % Math.ceil(xLabels.length / 10) === 0
        return show ? <text key={i} x={x} y={height - 8} textAnchor="middle" fontSize={10} fill="#9ca3af">{label}</text> : null
      })}

      {paths.map((p, i) => (
        <path key={i} d={p.d} fill="none" stroke={p.color} strokeWidth={2} strokeDasharray={p.dashed ? '6 4' : undefined} />
      ))}

      {points.map((pt, i) => (
        <circle key={i} cx={pt.x} cy={pt.y} r={3} fill={pt.color} stroke="#fff" strokeWidth={1.5}>
          {showTooltip && <title>{pt.name}: {pt.label} = {pt.value}</title>}
        </circle>
      ))}

      {showLegend && legendItems.length > 0 && (
        <g transform={`translate(${padding.left}, ${height - 2})`}>
          {legendItems.map((item, i) => (
            <g key={i} transform={`translate(${i * 120}, 0)`}>
              <line x1={0} y1={-3} x2={16} y2={-3} stroke={item.color} strokeWidth={2} />
              <text x={20} y={0} fontSize={10} fill="#6b7280">{item.label}</text>
            </g>
          ))}
        </g>
      )}
    </svg>
  )
}
