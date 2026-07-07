import { CalendarHeatmapDay } from '../types/dashboard.types'

interface CalendarHeatmapProps {
  days?: CalendarHeatmapDay[]
}

const weekdayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function CalendarHeatmap({ days = [] }: CalendarHeatmapProps) {
  const maxSessions = Math.max(...days.map((day) => day.session_count), 1)
  const sortedDays = [...days].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <section className="panel">
      <h3 className="panel-title">Calendar Heatmap: Daily Check-in Demand</h3>
      <p className="chart-subtitle">Each cell is one filtered date. Darker cells show days with heavier gym usage.</p>
      {sortedDays.length === 0 ? (
        <p className="muted">No daily session data available for the selected filters.</p>
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
