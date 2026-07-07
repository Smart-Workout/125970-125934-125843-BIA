import { ModelFeatureImpact } from '../types/dashboard.types'

interface ShapImpactPanelProps {
  rows?: ModelFeatureImpact[]
}

export default function ShapImpactPanel({ rows = [] }: ShapImpactPanelProps) {
  const maxImpact = Math.max(...rows.map((row) => row.impact), 1)

  return (
    <section className="panel">
      <h3 className="panel-title">Whitebox Model Insight: Feature Impact Summary</h3>
      <p className="chart-subtitle">Ranks model input signals used to explain intensity prediction behavior for review and governance.</p>
      {rows.length === 0 ? (
        <p className="muted">No model impact summary available.</p>
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
