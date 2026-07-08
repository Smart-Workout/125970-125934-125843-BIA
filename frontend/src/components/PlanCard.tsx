import { Calendar } from 'lucide-react'
import { GeneratedPlanResponse } from '../types/workout.types'
import FormattedText from './FormattedText'

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

interface PlanCardProps {
  plan?: GeneratedPlanResponse | null
}

export default function PlanCard({ plan }: PlanCardProps) {
  if (!plan) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon"><Calendar size={18} /></div>
        <p className="empty-state-title">No plan generated</p>
        <p className="empty-state-detail">Complete the Profile tab and click Generate to build your personalised weekly workout schedule.</p>
      </div>
    )
  }

  return (
    <div className="grid">
      <div className="plan-summary">
        <p style={{ margin: 0, fontWeight: 800 }}>{plan.plan_type}</p>
        <p className="muted" style={{ margin: '4px 0 0', fontSize: 13 }}>
          Readiness: {plan.readiness_band} | Intensity: {plan.predicted_intensity} | Final score: {plan.decision_mapping.combined_training_score}/100
        </p>
        <p className="muted" style={{ margin: '8px 0 0', fontSize: 12 }}>
          {plan.decision_mapping.primary_action}
        </p>
        <div className="focus-chip-row" style={{ marginTop: 12 }}>
          {plan.weekly_schedule.map((day) => (
            <span key={`${day.day}-${day.focus}`} className="focus-chip">
              {day.day}: {day.focus}
            </span>
          ))}
        </div>
      </div>
      <div className="plan-week-overview">
        {WEEK_DAYS.map((dayName) => {
          const scheduled = plan.weekly_schedule.find((d) => d.day === dayName)
          return (
            <div key={dayName} className={`plan-week-cell ${scheduled ? 'active-day' : 'rest-day'}`}>
              <span className="plan-week-day-abbr">{dayName.slice(0, 3)}</span>
              {scheduled ? (
                <>
                  <span className="plan-week-focus">{scheduled.focus}</span>
                  <span className="plan-week-count">{scheduled.exercises.length} ex</span>
                </>
              ) : (
                <span className="plan-week-focus">Rest</span>
              )}
            </div>
          )
        })}
      </div>
      <div className="plan-grid">
        {plan.weekly_schedule.map((day) => (
          <div key={day.day} className="plan-day">
            <div className="plan-day-header">
              <div>
                <p style={{ margin: 0, fontWeight: 780 }}>{day.day}</p>
                <p className="muted" style={{ margin: '4px 0 0', fontSize: 12 }}>{day.focus}</p>
              </div>
              <span className="session-count-chip">{day.exercises.length} exercises</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Exercise</th>
                    <th>Sets</th>
                    <th>Reps</th>
                    <th>Rest</th>
                  </tr>
                </thead>
                <tbody>
                  {day.exercises.map((exercise) => (
                    <tr key={`${day.day}-${exercise.exercise_id}`}>
                      <td>{exercise.name}</td>
                      <td>{exercise.sets}</td>
                      <td>{exercise.reps}</td>
                      <td>{exercise.rest_seconds}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
      <div className="panel" style={{ background: '#fff7ed' }}>
        <h3 className="panel-title">Safety Notes</h3>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {plan.safety_notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>
      <div className="panel">
        <h3 className="panel-title">RAG Snippets Used for Plan Rationale</h3>
        <div className="rag-snippet-grid">
          {plan.rag_snippets.map((snippet, index) => (
            <article key={`${snippet.source}-${index}`} className="snippet rag-snippet-card">
              <div className="rag-snippet-header">
                <span className="status-chip ready">{snippet.category}</span>
                <span className="rag-source">{snippet.source}</span>
              </div>
              <FormattedText text={snippet.text} />
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
