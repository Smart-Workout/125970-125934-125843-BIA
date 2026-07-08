import { Fragment } from 'react'
import { UsageHeatmapCell } from '../types/dashboard.types'

interface UsageHeatmapProps {
  cells?: UsageHeatmapCell[]
  loading?: boolean
}

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const hours = [6, 8, 10, 12, 14, 16, 18, 20, 22]

export default function UsageHeatmap({ cells = [], loading }: UsageHeatmapProps) {
  const lookup = new Map(cells.map((cell) => [`${cell.weekday}-${cell.hour}`, cell.session_count]))
  const maxValue = Math.max(...cells.map((cell) => cell.session_count), 1)

  return (
    <section className="panel">
      <h3 className="panel-title">Peak Utilization Heatmap by Weekday and Hour</h3>
      <p className="chart-subtitle">Darker cells indicate busier check-in periods, useful for staffing, class scheduling, and facility planning.</p>
      {loading ? (
        <div className="skeleton" style={{ height: 280, borderRadius: 8 }} />
      ) : cells.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><span style={{ fontSize: 22 }}>⊡</span></div>
          <p className="empty-state-title">No heatmap data</p>
          <p className="empty-state-detail">Check-in heatmap will populate once the selected filters return session data.</p>
        </div>
      ) : (<>
        <div className="heatmap-scroll">
          <div className="heatmap-grid" style={{ gridTemplateColumns: `112px repeat(${hours.length}, minmax(40px, 1fr))` }}>
          <span className="heatmap-axis" />
          {hours.map((hour) => (
            <span key={hour} className="heatmap-axis">{hour}:00</span>
          ))}
          {weekdays.map((weekday) => (
            <Fragment key={weekday}>
              <span key={`${weekday}-label`} className="heatmap-day">{weekday.slice(0, 3)}</span>
              {hours.map((hour) => {
                const value = lookup.get(`${weekday}-${hour}`) ?? 0
                const intensity = value / maxValue
                return (
                  <span
                    key={`${weekday}-${hour}`}
                    className="heatmap-cell"
                    title={`${weekday} ${hour}:00 - ${value} sessions`}
                    style={{ opacity: 0.22 + intensity * 0.78 }}
                  >
                    {value || ''}
                  </span>
                )
              })}
            </Fragment>
          ))}
          </div>
        </div>
      </>)
      }
      <p className="chart-legend">Legend: each cell count is filtered sessions for the selected month, location, and gender context.</p>
    </section>
  )
}
