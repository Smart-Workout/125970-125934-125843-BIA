import { RadarMetric } from '../types/dashboard.types'

interface RadarProfilePanelProps {
  metrics?: RadarMetric[]
  loading?: boolean
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

export default function RadarProfilePanel({ metrics = [], loading }: RadarProfilePanelProps) {
  const rows = metrics.slice(0, 4)

  return (
    <section className="panel">
      <h3 className="panel-title">Wellness Profile Comparison by Member Segment</h3>
      <p className="chart-subtitle">Each pentagon shape covers 5 wellness dimensions (all scored 0–100). A wider, rounder shape = a stronger overall wellness profile. Compare segments to spot which groups need the most support.</p>
      {loading ? (
        <div className="radar-grid">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="radar-card">
              <div className="skeleton" style={{ width: '100%', height: 160, borderRadius: 8 }} />
              <div className="skeleton skeleton-value" style={{ width: 90, marginTop: 8 }} />
              <div className="skeleton skeleton-detail" style={{ width: 120, marginTop: 6 }} />
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><span style={{ fontSize: 22 }}>◎</span></div>
          <p className="empty-state-title">No radar metrics available</p>
          <p className="empty-state-detail">Lifestyle cluster data will appear once the backend returns segmentation results.</p>
        </div>
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
                <strong>{row.label || `Segment ${row.cluster_id}`}</strong>
                <p className="muted" style={{ fontSize: 11, margin: '2px 0 0' }}>Segment {row.cluster_id}</p>
              </article>
            )
          })}
        </div>
      )}
      <p className="chart-legend">Each axis = one wellness dimension. Score 0 (centre) to 100 (outer edge). Wider shape = stronger wellness in that dimension.</p>
    </section>
  )
}
