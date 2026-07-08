import { CalendarHeatmapDay } from '../types/dashboard.types'

interface CalendarHeatmapProps {
  days?: CalendarHeatmapDay[]
  loading?: boolean
}

const weekdayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function CalendarHeatmap({ days = [], loading }: CalendarHeatmapProps) {
  const maxSessions = Math.max(...days.map((day) => day.session_count), 1)
  const sortedDays = [...days].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <section className="panel">
      <h3 className="panel-title">Daily Gym Traffic: Check-in Volume by Date</h3>
      <p className="chart-subtitle">Each square represents one day. Darker colour = more gym visits on that day. Hover over a date to see the exact session count. Use this to spot peak demand periods for staffing and scheduling.</p>
      {loading ? (
        <div className="skeleton" style={{ height: 320, borderRadius: 8 }} />
      ) : sortedDays.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><span style={{ fontSize: 22 }}>▦</span></div>
          <p className="empty-state-title">No calendar data</p>
          <p className="empty-state-detail">Daily check-in calendar will populate once the selected filters return session data.</p>
        </div>
      ) : (
        <>
          <div className="calendar-heatmap">
            <div className="calendar-weekdays">
              {weekdayOrder.map((day) => <span key={day}>{day.slice(0, 3)}</span>)}
            </div>
            <div className="calendar-grid">
              {sortedDays.map((day) => {
                const intensity = day.session_count / maxSessions
                return (
                  <span
                    key={day.date}
                    className="calendar-cell"
                    title={`${day.date}: ${day.session_count} sessions`}
                    style={{ opacity: 0.28 + intensity * 0.72 }}
                  >
                    {new Date(`${day.date}T00:00:00`).getDate()}
                  </span>
                )
              })}
            </div>
          </div>
          <p className="chart-legend">Legend: stronger color = higher check-in demand for that day under current slicers.</p>
        </>
      )}
    </section>
  )
}
