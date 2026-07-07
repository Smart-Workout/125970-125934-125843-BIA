import { ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from 'recharts'
import { EngagementScatterPoint } from '../types/dashboard.types'

interface EngagementScatterProps {
  points?: EngagementScatterPoint[]
}

export default function EngagementScatter({ points = [] }: EngagementScatterProps) {
  return (
    <section className="panel">
      <h3 className="panel-title">Member Engagement Scatter: Duration vs. Calories</h3>
      <p className="chart-subtitle">Each point represents one member summary; bubble size reflects session count.</p>
      {points.length === 0 ? (
        <p className="muted">No engagement points match the selected filters.</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <ScatterChart margin={{ top: 8, right: 16, bottom: 12, left: -8 }}>
            <XAxis type="number" dataKey="duration_minutes" name="Duration" unit=" min" tick={{ fontSize: 11 }} />
            <YAxis type="number" dataKey="calories_burned" name="Calories" unit=" kcal" tick={{ fontSize: 11 }} />
            <ZAxis type="number" dataKey="session_count" range={[50, 220]} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter data={points} fill="#176b87" fillOpacity={0.78} />
          </ScatterChart>
        </ResponsiveContainer>
      )}
      <p className="chart-legend">Legend: x-axis = average duration, y-axis = average calories, bubble size = sampled visits.</p>
    </section>
  )
}
