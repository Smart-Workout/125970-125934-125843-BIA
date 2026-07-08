import { ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from 'recharts'
import { EngagementScatterPoint } from '../types/dashboard.types'

interface EngagementScatterProps {
  points?: EngagementScatterPoint[]
  loading?: boolean
}

export default function EngagementScatter({ points = [], loading }: EngagementScatterProps) {
  return (
    <section className="panel">
      <h3 className="panel-title">Member Engagement: Session Length vs. Calories Burned</h3>
      <p className="chart-subtitle">Each dot is one member's average session. X-axis = session length (minutes). Y-axis = calories burned. Bigger bubbles = more gym visits recorded. Members in the upper-right train both long and hard.</p>
      {loading ? (
        <div className="chart-skeleton">
          {[50, 70, 40, 85, 60, 45, 75].map((h, i) => (
            <div key={i} className="skeleton chart-skeleton-bar" style={{ height: `${h}%` }} />
          ))}
        </div>
      ) : points.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><span style={{ fontSize: 22 }}>●</span></div>
          <p className="empty-state-title">No engagement data</p>
          <p className="empty-state-detail">Scatter points will appear once member engagement data is returned by the backend.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={252}>
          <ScatterChart margin={{ top: 8, right: 16, bottom: 12, left: -8 }}>
            <XAxis type="number" dataKey="duration_minutes" name="Duration" unit=" min" tick={{ fontSize: 11 }} />
            <YAxis type="number" dataKey="calories_burned" name="Calories" unit=" kcal" tick={{ fontSize: 11 }} />
            <ZAxis type="number" dataKey="session_count" range={[50, 220]} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter data={points} fill="#176b87" fillOpacity={0.78} />
          </ScatterChart>
        </ResponsiveContainer>
      )}
      <p className="chart-legend">X-axis: average session length (minutes). Y-axis: average calories burned per session. Bubble size: number of recorded visits.</p>
    </section>
  )
}
