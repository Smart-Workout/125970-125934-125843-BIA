import { BarChart2 } from 'lucide-react'
import { IntensityBand } from '../types/workout.types'

interface ProbabilityBarsProps {
  probabilities?: Record<IntensityBand, number>
}

const bands: IntensityBand[] = ['Low', 'Medium', 'High']

export default function ProbabilityBars({ probabilities }: ProbabilityBarsProps) {
  if (!probabilities) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon"><BarChart2 size={18} /></div>
        <p className="empty-state-title">No probabilities yet</p>
        <p className="empty-state-detail">Model confidence scores for Low, Medium, and High intensity will appear after generating a plan.</p>
      </div>
    )
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

