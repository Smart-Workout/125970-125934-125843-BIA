import { ModelFeatureImpact } from '../types/dashboard.types'

interface ShapImpactPanelProps {
  rows?: ModelFeatureImpact[]
  loading?: boolean
}

export default function ShapImpactPanel({ rows = [], loading }: ShapImpactPanelProps) {
  const maxImpact = Math.max(...rows.map((row) => row.impact), 1)

  return (
    <section className="panel">
      <h3 className="panel-title">What Drives the Intensity Prediction? (Top Model Inputs)</h3>
      <p className="chart-subtitle">Shows which parts of a member's profile most influence the predicted workout intensity. Longer bars = greater impact on the prediction. Use this to understand and audit how the model makes its decisions.</p>
      {loading ? (
        <div className="shap-list">
          {[0.9, 0.7, 0.55, 0.4, 0.3].map((w, i) => (
            <div key={i} className="shap-row">
              <div style={{ flex: 1 }}>
                <div className="skeleton skeleton-value" style={{ width: `${w * 60}%`, marginBottom: 6 }} />
                <div className="skeleton skeleton-detail" style={{ width: `${w * 80}%` }} />
              </div>
              <div className="shap-bar-wrap">
                <div className="skeleton" style={{ width: 40, height: 16, borderRadius: 999 }} />
                <div className="skeleton" style={{ width: `${w * 100}%`, height: 10, borderRadius: 4, marginTop: 4 }} />
              </div>
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><span style={{ fontSize: 22 }}>⊡</span></div>
          <p className="empty-state-title">No feature impact data</p>
          <p className="empty-state-detail">SHAP-style feature importance will appear once the exercise plan workspace data is loaded.</p>
        </div>
      ) : (
        <div className="shap-list">
          {rows.map((row) => (
            <div key={row.feature} className="shap-row">
              <div>
                <p className="shap-feature">{row.feature}</p>
                <p className="muted" style={{ margin: '4px 0 0', fontSize: 11 }}>{row.explanation}</p>
              </div>
              <div className="shap-bar-wrap">
                <span className={`shap-direction ${row.direction}`}>{row.direction}</span>
                <div className="shap-track">
                  <span className="shap-fill" style={{ width: `${Math.max(8, (row.impact / maxImpact) * 100)}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="chart-legend">Legend: longer bars represent stronger relative model impact; direction labels show whether the feature primarily raises intensity or provides context.</p>
    </section>
  )
}
