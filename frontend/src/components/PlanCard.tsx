import { GeneratedPlanResponse } from '../types/workout.types'

interface PlanCardProps {
  plan?: GeneratedPlanResponse | null
}

export default function PlanCard({ plan }: PlanCardProps) {
  if (!plan) {
    return <p className="muted">Generate a plan from the Profile tab to see the weekly schedule.</p>
  }

  return (
    <div className="grid">
      <div className="plan-summary">
        <p style={{ margin: 0, fontWeight: 800 }}>{plan.plan_type}</p>
        <p className="muted" style={{ margin: '4px 0 0', fontSize: 13 }}>
          Readiness: {plan.readiness_band} | Intensity: {plan.predicted_intensity}
        </p>
        <p className="muted" style={{ margin: '8px 0 0', fontSize: 12 }}>
          The readiness label is an estimation from current wellness inputs. The intensity label is the model prediction used to assemble this weekly plan.
        </p>
        <div className="focus-chip-row" style={{ marginTop: 12 }}>
          {plan.weekly_schedule.map((day) => (
            <span key={`${day.day}-${day.focus}`} className="focus-chip">
              {day.day}: {day.focus}
            </span>
          ))}
        </div>
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
        <div className="grid">
          {plan.rag_snippets.map((snippet, index) => (
            <div key={`${snippet.source}-${index}`} className="snippet">
              <p style={{ margin: 0, fontSize: 12, fontWeight: 780 }}>{snippet.category}</p>
              <p className="muted" style={{ margin: '3px 0 8px', fontSize: 12 }}>{snippet.source}</p>
              <p style={{ margin: 0 }}>{snippet.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
