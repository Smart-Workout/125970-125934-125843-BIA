import { CartesianGrid, Legend, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from 'recharts'
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
      <h3 className="panel-title">Lifestyle Cluster Scatter</h3>
      <p className="muted" style={{ margin: '0 0 12px', fontSize: 13 }}>
        Each point is a lifestyle archetype grouping. X axis is sleep hours, Y axis is physical activity level, and point size is readiness score.
      </p>
      {loading ? (
        <p className="muted">Loading clustering view...</p>
      ) : chartData.length === 0 ? (
        <p className="muted">No clustering points available.</p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <ScatterChart margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4ebf2" />
            <XAxis type="number" dataKey="sleep_duration" name="Sleep hours" label={{ value: 'Sleep hours', position: 'insideBottom', offset: -6, fontSize: 12 }} tick={{ fontSize: 11 }} />
            <YAxis type="number" dataKey="physical_activity_level" name="Activity" label={{ value: 'Activity level', angle: -90, position: 'insideLeft', dy: -12, fontSize: 12 }} tick={{ fontSize: 11 }} />
            <ZAxis type="number" dataKey="readiness_score" range={[50, 220]} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Legend verticalAlign="top" height={28} />
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
