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
      <div>
        <p style={{ margin: 0, fontWeight: 800 }}>{plan.plan_type}</p>
        <p className="muted" style={{ margin: '4px 0 0', fontSize: 13 }}>
          Readiness: {plan.readiness_band} | Intensity: {plan.predicted_intensity}
        </p>
      </div>
      {plan.weekly_schedule.map((day) => (
        <div key={day.day} className="plan-day">
          <p style={{ margin: '0 0 8px', fontWeight: 780 }}>{day.day}: {day.focus}</p>
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
