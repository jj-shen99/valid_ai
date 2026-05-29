import React, { useMemo } from 'react'

export default function SVGAreaChart({ data, dataKey = 'count', nameKey = 'name', color = '#3b82f6', width = 560, height = 250, showGrid = true }) {
  const padding = { top: 15, right: 20, bottom: 35, left: 45 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const { yMax, pathD, areaD, pts, xLabels, yTicks } = useMemo(() => {
    if (!data || data.length === 0) return { yMax: 1, pathD: '', areaD: '', pts: [], xLabels: [], yTicks: [] }

    const vals = data.map(d => d[dataKey] || 0)
    const mx = Math.max(...vals, 1)
    const xLabels = data.map(d => d[nameKey] || '')

    let pathD = ''
    let areaD = ''
    const pts = []

    data.forEach((d, i) => {
      const x = padding.left + (data.length > 1 ? (i / (data.length - 1)) * chartW : chartW / 2)
      const y = padding.top + chartH - ((d[dataKey] || 0) / mx) * chartH
      pathD += (pathD ? ` L${x},${y}` : `M${x},${y}`)
      pts.push({ x, y, value: d[dataKey] || 0, name: d[nameKey] })
    })

    const firstX = padding.left
    const lastX = padding.left + (data.length > 1 ? chartW : chartW / 2)
    const baseY = padding.top + chartH
    areaD = pathD + ` L${lastX},${baseY} L${firstX},${baseY} Z`

    const step = Math.ceil(mx / 4) || 1
    const yTicks = []
    for (let v = 0; v <= mx; v += step) yTicks.push(v)
    if (yTicks[yTicks.length - 1] < mx) yTicks.push(mx)

    return { yMax: mx, pathD, areaD, pts, xLabels, yTicks }
  }, [data, dataKey, nameKey, chartW, chartH, padding.left, padding.top])

  if (!data || data.length === 0) return <p className="text-sm text-gray-400 text-center py-8">No data</p>

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: height }}>
      {showGrid && yTicks.map(v => {
        const y = padding.top + chartH - (v / yMax) * chartH
        return (
          <g key={v}>
            <line x1={padding.left} y1={y} x2={padding.left + chartW} y2={y} stroke="#f0f0f0" strokeWidth={1} />
            <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize={10} fill="#9ca3af">{v}</text>
          </g>
        )
      })}
      <path d={areaD} fill={color} opacity={0.12} />
      <path d={pathD} fill="none" stroke={color} strokeWidth={2} />
      {pts.map((pt, i) => (
        <circle key={i} cx={pt.x} cy={pt.y} r={2.5} fill={color} stroke="#fff" strokeWidth={1}>
          <title>{pt.name}: {pt.value}</title>
        </circle>
      ))}
      {xLabels.map((label, i) => {
        const x = padding.left + (xLabels.length > 1 ? (i / (xLabels.length - 1)) * chartW : chartW / 2)
        const show = xLabels.length <= 10 || i % Math.ceil(xLabels.length / 8) === 0
        return show ? <text key={i} x={x} y={height - 6} textAnchor="middle" fontSize={10} fill="#9ca3af">{label}</text> : null
      })}
    </svg>
  )
}
