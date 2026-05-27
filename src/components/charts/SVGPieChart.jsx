import React, { useMemo } from 'react'

export default function SVGPieChart({ data, dataKey = 'value', nameKey = 'name', colorKey = 'color', size = 200, innerRadius = 0, showLabels = true, showLegend = true }) {
  const r = size / 2 - 10
  const ir = innerRadius
  const cx = size / 2
  const cy = size / 2

  const total = useMemo(() => data.reduce((s, d) => s + (d[dataKey] || 0), 0), [data, dataKey])

  const slices = useMemo(() => {
    if (total === 0) return []
    let cumAngle = -90
    return data.filter(d => d[dataKey] > 0).map(d => {
      const angle = (d[dataKey] / total) * 360
      const startAngle = cumAngle
      const endAngle = cumAngle + angle
      cumAngle = endAngle
      const rad = Math.PI / 180
      const x1 = cx + r * Math.cos(startAngle * rad)
      const y1 = cy + r * Math.sin(startAngle * rad)
      const x2 = cx + r * Math.cos(endAngle * rad)
      const y2 = cy + r * Math.sin(endAngle * rad)
      const largeArc = angle > 180 ? 1 : 0
      const midAngle = (startAngle + endAngle) / 2
      const labelR = r * 0.65
      const lx = cx + labelR * Math.cos(midAngle * rad)
      const ly = cy + labelR * Math.sin(midAngle * rad)

      let pathD
      if (angle >= 359.9) {
        pathD = ir > 0
          ? `M${cx - r},${cy} A${r},${r} 0 1,1 ${cx + r},${cy} A${r},${r} 0 1,1 ${cx - r},${cy} M${cx - ir},${cy} A${ir},${ir} 0 1,0 ${cx + ir},${cy} A${ir},${ir} 0 1,0 ${cx - ir},${cy}`
          : `M${cx - r},${cy} A${r},${r} 0 1,1 ${cx + r},${cy} A${r},${r} 0 1,1 ${cx - r},${cy}`
      } else if (ir > 0) {
        const ix1 = cx + ir * Math.cos(startAngle * rad)
        const iy1 = cy + ir * Math.sin(startAngle * rad)
        const ix2 = cx + ir * Math.cos(endAngle * rad)
        const iy2 = cy + ir * Math.sin(endAngle * rad)
        pathD = `M${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} L${ix2},${iy2} A${ir},${ir} 0 ${largeArc},0 ${ix1},${iy1} Z`
      } else {
        pathD = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`
      }

      return {
        d: pathD,
        color: d[colorKey] || '#6366f1',
        name: d[nameKey],
        value: d[dataKey],
        pct: Math.round((d[dataKey] / total) * 100),
        lx, ly,
      }
    })
  }, [data, dataKey, nameKey, colorKey, total, cx, cy, r, ir])

  if (total === 0) return <p className="text-sm text-gray-400 text-center py-8">No data</p>

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((s, i) => (
          <path key={i} d={s.d} fill={s.color}>
            <title>{s.name}: {s.value} ({s.pct}%)</title>
          </path>
        ))}
        {showLabels && slices.length > 1 && slices.map((s, i) => (
          s.pct >= 8 && <text key={`l${i}`} x={s.lx} y={s.ly} textAnchor="middle" dominantBaseline="central" fontSize={10} fill="#fff" fontWeight={600}>{s.pct}%</text>
        ))}
      </svg>
      {showLegend && (
        <div className="space-y-1.5">
          {slices.map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-gray-700">{s.name}</span>
              <span className="font-semibold text-gray-900">{s.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
