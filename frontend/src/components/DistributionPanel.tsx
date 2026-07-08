import { DistributionSummary } from '../types/dashboard.types'

interface DistributionPanelProps {
  title: string
  subtitle: string
  summary?: DistributionSummary
}

const pct = (value: number, min: number, max: number) => {
  if (max <= min) return 0
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))
}

export default function DistributionPanel({ title, subtitle, summary }: DistributionPanelProps) {
  if (!summary || summary.histogram.labels.length === 0) {
    return (
      <section className="panel">
        <h3 className="panel-title">{title}</h3>
        <p className="muted">No distribution data available for the selected filters.</p>
      </section>
    )
  }

  const maxBucket = Math.max(...summary.histogram.values, 1)
  const min = summary.min_value
  const max = summary.max_value
  const q1 = pct(summary.q1, min, max)
  const median = pct(summary.median, min, max)
  const q3 = pct(summary.q3, min, max)

  return (
    <section className="panel">
      <h3 className="panel-title">{title}</h3>
      <p className="chart-subtitle">{subtitle}</p>
      <div className="distribution-summary">
        <div>
          <span>Median</span>
          <strong title={`Median: ${summary.median} ${summary.unit}`}>{summary.median} {summary.unit}</strong>
        </div>
        <div>
          <span>IQR</span>
          <strong title={`IQR: ${summary.q1}-${summary.q3} ${summary.unit}`}>{summary.q1}-{summary.q3}</strong>
        </div>
        <div>
          <span>Outliers</span>
          <strong title={`Outliers: ${summary.outlier_count}`}>{summary.outlier_count}</strong>
        </div>
      </div>
      <div className="box-plot" aria-label={`${summary.metric} box plot`}>
        <span className="box-plot-line" title={`Range: min ${min} ${summary.unit} to max ${max} ${summary.unit}`} />
        <span className="box-plot-range" style={{ left: `${q1}%`, width: `${Math.max(q3 - q1, 2)}%` }} title={`IQR box: Q1 ${summary.q1} ${summary.unit} to Q3 ${summary.q3} ${summary.unit}`} />
        <span className="box-plot-median" style={{ left: `${median}%` }} title={`Median: ${summary.median} ${summary.unit}`} />
        <span className="box-plot-label left" title={`Min: ${min} ${summary.unit}`}>{min}</span>
        <span className="box-plot-label right" title={`Max: ${max} ${summary.unit}`}>{max}</span>
      </div>
      <div className="histogram-bars">
        {summary.histogram.labels.map((label, index) => {
          const value = summary.histogram.values[index] ?? 0
          return (
            <div key={label} className="histogram-bar-wrap">
              <span className="histogram-value" title={`${value} records`}>{value}</span>
              <span className="histogram-bar" style={{ height: `${Math.max(8, (value / maxBucket) * 120)}px` }} title={`${label}: ${value}`} />
              <small title={`${label} ${summary.unit}: ${value} records`}>{label}</small>
            </div>
          )
        })}
      </div>
      <p className="chart-legend">Legend: box plot shows min, Q1, median, Q3, max; bars show record count per range.</p>
    </section>
  )
}
