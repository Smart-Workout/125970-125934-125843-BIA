import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from 'recharts'
import { LifestyleScatterPoint } from '../types/dashboard.types'

interface LifestyleScatterPanelProps {
  points?: LifestyleScatterPoint[]
  loading?: boolean
  clusterNames?: Record<number, string>
}

const clusterColors = ['#176b87', '#2a9d8f', '#e9c46a', '#7c3aed', '#e76f51']

export default function LifestyleScatterPanel({ points, loading, clusterNames }: LifestyleScatterPanelProps) {
  const chartData = points ?? []

  return (
    <section className="panel">
      <h3 className="panel-title">Member Wellness Groups: Sleep Hours vs. Physical Activity</h3>
      <p className="chart-subtitle">Each dot is one gym member. Bigger dots = higher training readiness. X-axis = average nightly sleep. Y-axis = physical activity level (0–100 scale). Colours identify the 4 lifestyle segments.</p>
      {loading ? (
        <div className="chart-skeleton">
          {[60, 40, 80, 50, 70, 45, 65].map((h, i) => (
            <div key={i} className="skeleton chart-skeleton-bar" style={{ height: `${h}%` }} />
          ))}
        </div>
      ) : chartData.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><span style={{ fontSize: 22 }}>⊹</span></div>
          <p className="empty-state-title">No cluster scatter data</p>
          <p className="empty-state-detail">Scatter points will appear once lifestyle segmentation data is returned by the backend.</p>
        </div>
      ) : (
        <>
        <ResponsiveContainer width="100%" height={420}>
          <ScatterChart margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4ebf2" />
            <XAxis type="number" dataKey="sleep_duration" name="Sleep hours" tick={{ fontSize: 11 }} />
            <YAxis type="number" dataKey="physical_activity_level" name="Activity" domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
            <ZAxis type="number" dataKey="readiness_score" range={[50, 220]} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            {[0, 1, 2, 3, 4].map((clusterId) => (
              <Scatter
                key={clusterId}
                name={clusterNames?.[clusterId] ?? `Segment ${clusterId}`}
                data={chartData.filter((point) => point.cluster_id === clusterId)}
                fill={clusterColors[clusterId % clusterColors.length]}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
        <div className="cluster-legend">
          {[...new Set(chartData.map(p => p.cluster_id))].sort((a, b) => a - b).map((id) => (
            <span key={id} className="cluster-legend-item">
              <span className="cluster-legend-dot" style={{ background: clusterColors[id % clusterColors.length] }} />
              {clusterNames?.[id] ?? `Segment ${id}`}
            </span>
          ))}
        </div>
        </>
      )}
    </section>
  )
}
