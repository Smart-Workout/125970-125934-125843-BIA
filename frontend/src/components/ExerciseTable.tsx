import { Dumbbell } from 'lucide-react'
import { ExerciseRecommendation } from '../types/workout.types'

interface ExerciseTableProps {
  exercises: ExerciseRecommendation[]
}

export default function ExerciseTable({ exercises }: ExerciseTableProps) {
  if (!exercises.length) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon"><Dumbbell size={18} /></div>
        <p className="empty-state-title">No exercises yet</p>
        <p className="empty-state-detail">Generate a plan to see your personalised exercise recommendations here.</p>
      </div>
    )
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Exercise</th>
            <th>Body Part</th>
            <th>Equipment</th>
            <th>Match</th>
          </tr>
        </thead>
        <tbody>
          {exercises.map((exercise) => (
            <tr key={exercise.exercise_id}>
              <td>{exercise.name}</td>
              <td>{exercise.body_parts.join(', ')}</td>
              <td>{exercise.equipment.join(', ')}</td>
              <td>{Math.round(exercise.match_score * 100)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

