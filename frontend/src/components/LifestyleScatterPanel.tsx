import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from 'recharts'
import { LifestyleScatterPoint } from '../types/dashboard.types'

interface LifestyleScatterPanelProps {
  points?: LifestyleScatterPoint[]
  loading?: boolean
}

const clusterColors = ['#176b87', '#2a9d8f', '#e9c46a', '#7c3aed', '#e76f51']

export default function LifestyleScatterPanel({ points, loading }: LifestyleScatterPanelProps) {
  const chartData = points ?? []

  return (
    <section className="panel">
      <h3 className="panel-title">Cluster Scatter: Sleep x Activity</h3>
      {loading ? (
        <p className="muted">Loading clustering view...</p>
      ) : chartData.length === 0 ? (
        <p className="muted">No clustering points available.</p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <ScatterChart margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4ebf2" />
            <XAxis type="number" dataKey="sleep_duration" name="Sleep hours" tick={{ fontSize: 11 }} />
            <YAxis type="number" dataKey="physical_activity_level" name="Activity" tick={{ fontSize: 11 }} />
            <ZAxis type="number" dataKey="readiness_score" range={[50, 220]} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            {[0, 1, 2, 3, 4].map((clusterId) => (
              <Scatter
                key={clusterId}
                name={`Cluster ${clusterId}`}
                data={chartData.filter((point) => point.cluster_id === clusterId)}
                fill={clusterColors[clusterId % clusterColors.length]}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      )}
    </section>
  )
}
