import { Activity, Gauge, HeartPulse, ShieldCheck } from 'lucide-react'
import { IntensityPredictionResponse, ReadinessResult, RecommendationMapping } from '../types/workout.types'

interface DecisionMappingPanelProps {
  readiness?: ReadinessResult | null
  intensity?: IntensityPredictionResponse | null
  mapping?: RecommendationMapping | null
}

const impactLabel = (impact: number) => (impact > 0 ? `+${impact}` : `${impact}`)

export default function DecisionMappingPanel({ readiness, intensity, mapping }: DecisionMappingPanelProps) {
  const readinessScore = readiness?.score ?? mapping?.readiness_score ?? intensity?.readiness_score
  const readinessBand = readiness?.band ?? mapping?.readiness_band ?? intensity?.readiness_band
  const intensityBand = mapping?.predicted_intensity ?? intensity?.predicted_class

  return (
    <section className="panel decision-panel">
      <div className="panel-heading-row">
        <div>
          <h3 className="panel-title">Intensity + Readiness Mapping</h3>
          <p className="muted panel-subtitle">
            Readiness controls safety and recovery. Intensity controls workload. The final score decides how the plan volume is adjusted.
          </p>
        </div>
        {mapping?.readiness_cap_applied && <span className="status-chip pending">Readiness cap applied</span>}
      </div>

      {readinessScore === undefined && !mapping ? (
        <p className="muted">Generate a plan to see the decision mapping.</p>
      ) : (
        <div className="grid">
          <div className="decision-score-grid">
            <div className="decision-score-card">
              <HeartPulse size={18} />
              <span>Readiness</span>
              <strong>{readinessScore ?? '-'}/100</strong>
              <small>{readinessBand ?? 'Waiting'}</small>
            </div>
            <div className="decision-score-card">
              <Gauge size={18} />
              <span>Intensity</span>
              <strong>{mapping?.intensity_score ?? '-'}/100</strong>
              <small>{intensityBand ?? 'Waiting'}</small>
            </div>
            <div className="decision-score-card">
              <ShieldCheck size={18} />
              <span>Final score</span>
              <strong>{mapping?.combined_training_score ?? '-'}/100</strong>
              <small>{mapping?.recommendation_level ?? 'Waiting for plan'}</small>
            </div>
            <div className="decision-score-card">
              <Activity size={18} />
              <span>Plan output</span>
              <strong>{mapping ? `${mapping.sets_per_exercise} x ${mapping.reps}` : '-'}</strong>
              <small>{mapping ? `${mapping.exercise_target_per_session} exercises, ${mapping.rest_seconds}s rest` : 'Waiting for plan'}</small>
            </div>
          </div>

          {mapping && (
            <div className="decision-action">
              <p className="insight-label">Recommendation action</p>
              <p className="insight-value">{mapping.primary_action}</p>
              <p className="muted" style={{ margin: '8px 0 0', fontSize: 12 }}>
                Volume multiplier: {mapping.volume_multiplier.toFixed(2)}x
              </p>
            </div>
          )}

          {readiness?.score_breakdown.length ? (
            <div className="table-wrap">
              <table className="score-table">
                <thead>
                  <tr>
                    <th>Signal</th>
                    <th>Score Impact</th>
                    <th>Dashboard Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  {readiness.score_breakdown.map((item) => (
                    <tr key={item.signal}>
                      <td>{item.label}</td>
                      <td className={item.impact < 0 ? 'negative-impact' : 'neutral-impact'}>{impactLabel(item.impact)}</td>
                      <td>{item.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {mapping?.rationale.length ? (
            <div className="mapping-rationale">
              {mapping.rationale.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </section>
  )
}
