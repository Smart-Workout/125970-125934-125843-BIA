import { IntensityBand } from '../types/workout.types'

interface ProbabilityBarsProps {
  probabilities?: Record<IntensityBand, number>
}

const bands: IntensityBand[] = ['Low', 'Medium', 'High']

export default function ProbabilityBars({ probabilities }: ProbabilityBarsProps) {
  if (!probabilities) {
    return <p className="muted">Generate a plan to see class probabilities.</p>
  }

  return (
    <div className="grid">
      {bands.map((band) => {
        const value = probabilities[band] ?? 0
        return (
          <div key={band}>
            <div className="probability-label">
              <span>{band}</span>
              <span>{Math.round(value * 100)}%</span>
            </div>
            <div className="probability-track">
              <div className={`probability-fill ${band.toLowerCase()}`} style={{ width: `${Math.round(value * 100)}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

