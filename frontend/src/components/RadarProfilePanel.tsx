import { RadarMetric } from '../types/dashboard.types'

interface RadarProfilePanelProps {
  metrics?: RadarMetric[]
}

const axes = [
  { key: 'sleep_score', label: 'Sleep' },
  { key: 'activity_score', label: 'Activity' },
  { key: 'stress_score', label: 'Stress control' },
  { key: 'readiness_score', label: 'Readiness' },
  { key: 'recovery_score', label: 'Recovery' },
] as const

const pointFor = (index: number, value: number, radius = 72) => {
  const angle = ((Math.PI * 2) / axes.length) * index - Math.PI / 2
  const scaled = (Math.max(0, Math.min(100, value)) / 100) * radius
  return {
    x: 90 + Math.cos(angle) * scaled,
    y: 90 + Math.sin(angle) * scaled,
  }
}

export default function RadarProfilePanel({ metrics = [] }: RadarProfilePanelProps) {
  const rows = metrics.slice(0, 4)

  return (
    <section className="panel">
      <h3 className="panel-title">Radar Chart: Lifestyle Cluster Readiness Profile</h3>
      <p className="chart-subtitle">Compares normalized sleep, activity, stress control, readiness, and recovery signals by cluster.</p>
      {rows.length === 0 ? (
        <p className="muted">No lifestyle radar metrics available.</p>
      ) : (
        <div className="radar-grid">
          {rows.map((row) => {
            const values = axes.map((axis) => row[axis.key])
            const polygon = values.map((value, index) => pointFor(index, value)).map((point) => `${point.x},${point.y}`).join(' ')
            return (
              <article key={row.cluster_id} className="radar-card">
                <svg viewBox="0 0 180 180" role="img" aria-label={`Cluster ${row.cluster_id} radar profile`}>
                  {[25, 50, 75, 100].map((level) => {
                    const points = axes.map((_, index) => pointFor(index, level)).map((point) => `${point.x},${point.y}`).join(' ')
                    return <polygon key={level} points={points} className="radar-ring" />
                  })}
                  {axes.map((axis, index) => {
                    const end = pointFor(index, 100)
                    return (
                      <g key={axis.key}>
                        <line x1="90" y1="90" x2={end.x} y2={end.y} className="radar-axis" />
                        <text x={end.x} y={end.y} className="radar-label">{axis.label}</text>
                      </g>
                    )
                  })}
                  <polygon points={polygon} className="radar-shape" />
                </svg>
                <strong>Cluster {row.cluster_id}</strong>
                <p>{row.label}</p>
              </article>
            )
          })}
        </div>
      )}
      <p className="chart-legend">Legend: wider shape indicates stronger normalized lifestyle readiness profile.</p>
    </section>
  )
}
