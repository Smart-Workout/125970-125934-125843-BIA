import { FormEvent, useState } from 'react'
import { BodyPart, Goal, UserProfileRequest } from '../types/workout.types'

const equipmentOptions = ['dumbbell', 'bench', 'barbell', 'body weight', 'machine', 'cable']
const bodyParts: BodyPart[] = ['chest', 'back', 'legs', 'arms', 'shoulders', 'core', 'waist', 'full body']
const goals: Goal[] = ['strength', 'muscle gain', 'fat loss', 'general fitness']

type ProfileFormState = Omit<
  UserProfileRequest,
  'age' | 'height_cm' | 'weight_kg' | 'sleep_hours' | 'stress_level' | 'resting_heart_rate' | 'sessions_per_week'
> & {
  age: string
  height_cm: string
  weight_kg: string
  sleep_hours: string
  stress_level: string
  resting_heart_rate: string
  sessions_per_week: string
}

const defaultProfile: ProfileFormState = {
  age: '22',
  height_cm: '165',
  weight_kg: '60',
  sleep_hours: '7',
  stress_level: '4',
  blood_pressure: '120/80',
  resting_heart_rate: '72',
  target_body_part: 'chest',
  available_equipment: ['dumbbell', 'bench'],
  sessions_per_week: '3',
  goal: 'strength',
}

interface ProfileFormProps {
  loading?: boolean
  onSubmit: (profile: UserProfileRequest) => void
}

export default function ProfileForm({ loading, onSubmit }: ProfileFormProps) {
  const [profile, setProfile] = useState<ProfileFormState>(defaultProfile)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const setField = <K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) => {
    setProfile((current) => ({ ...current, [key]: value }))
  }

  const toggleEquipment = (item: string) => {
    setProfile((current) => {
      const exists = current.available_equipment.includes(item)
      return {
        ...current,
        available_equipment: exists
          ? current.available_equipment.filter((value) => value !== item)
          : [...current.available_equipment, item],
      }
    })
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const nextErrors: Record<string, string> = {}
    const parsedProfile: UserProfileRequest = {
      ...profile,
      age: Number(profile.age),
      height_cm: Number(profile.height_cm),
      weight_kg: Number(profile.weight_kg),
      sleep_hours: Number(profile.sleep_hours),
      stress_level: Number(profile.stress_level),
      resting_heart_rate: Number(profile.resting_heart_rate),
      sessions_per_week: Number(profile.sessions_per_week),
    }

    if (!profile.age || parsedProfile.age < 13 || parsedProfile.age > 90) nextErrors.age = 'Age must be between 13 and 90.'
    if (!profile.height_cm || parsedProfile.height_cm < 100 || parsedProfile.height_cm > 230) nextErrors.height_cm = 'Height must be between 100 and 230 cm.'
    if (!profile.weight_kg || parsedProfile.weight_kg < 30 || parsedProfile.weight_kg > 250) nextErrors.weight_kg = 'Weight must be between 30 and 250 kg.'
    if (!profile.sleep_hours || parsedProfile.sleep_hours < 0 || parsedProfile.sleep_hours > 14) nextErrors.sleep_hours = 'Sleep must be between 0 and 14 hours.'
    if (!profile.stress_level || parsedProfile.stress_level < 1 || parsedProfile.stress_level > 10) nextErrors.stress_level = 'Stress level must be 1 to 10.'
    if (!/^\d{2,3}\/\d{2,3}$/.test(profile.blood_pressure)) nextErrors.blood_pressure = 'Use blood pressure format like 120/80.'
    if (!profile.resting_heart_rate || parsedProfile.resting_heart_rate < 35 || parsedProfile.resting_heart_rate > 140) nextErrors.resting_heart_rate = 'Heart rate must be between 35 and 140 bpm.'
    if (!profile.sessions_per_week || parsedProfile.sessions_per_week < 1 || parsedProfile.sessions_per_week > 6) nextErrors.sessions_per_week = 'Sessions per week must be 1 to 6.'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    onSubmit(parsedProfile)
  }

  return (
    <form className="grid" onSubmit={handleSubmit}>
      <section className="panel">
        <h3 className="panel-title">About You</h3>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="age">Age</label>
            <input id="age" type="number" min={13} max={90} value={profile.age} onChange={(event) => setField('age', event.target.value)} />
            {errors.age && <span className="field-error">{errors.age}</span>}
          </div>
          <div className="field">
            <label htmlFor="height">Height (cm)</label>
            <input id="height" type="number" min={100} max={230} value={profile.height_cm} onChange={(event) => setField('height_cm', event.target.value)} />
            {errors.height_cm && <span className="field-error">{errors.height_cm}</span>}
          </div>
          <div className="field">
            <label htmlFor="weight">Weight (kg)</label>
            <input id="weight" type="number" min={30} max={250} value={profile.weight_kg} onChange={(event) => setField('weight_kg', event.target.value)} />
            {errors.weight_kg && <span className="field-error">{errors.weight_kg}</span>}
          </div>
        </div>
      </section>

      <section className="panel">
        <h3 className="panel-title">Wellness Today</h3>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="sleep">Sleep hours</label>
            <input id="sleep" type="number" min={0} max={14} step={0.5} value={profile.sleep_hours} onChange={(event) => setField('sleep_hours', event.target.value)} />
            {errors.sleep_hours && <span className="field-error">{errors.sleep_hours}</span>}
          </div>
          <div className="field">
            <label htmlFor="stress">Stress level</label>
            <input id="stress" type="number" min={1} max={10} value={profile.stress_level} onChange={(event) => setField('stress_level', event.target.value)} />
            {errors.stress_level && <span className="field-error">{errors.stress_level}</span>}
          </div>
          <div className="field">
            <label htmlFor="bp">Blood pressure</label>
            <input id="bp" value={profile.blood_pressure} onChange={(event) => setField('blood_pressure', event.target.value)} />
            {errors.blood_pressure && <span className="field-error">{errors.blood_pressure}</span>}
          </div>
          <div className="field">
            <label htmlFor="hr">Resting heart rate</label>
            <input id="hr" type="number" min={35} max={140} value={profile.resting_heart_rate} onChange={(event) => setField('resting_heart_rate', event.target.value)} />
            {errors.resting_heart_rate && <span className="field-error">{errors.resting_heart_rate}</span>}
          </div>
        </div>
      </section>

      <section className="panel">
        <h3 className="panel-title">Training Intent</h3>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="body-part">Target body part</label>
            <select id="body-part" value={profile.target_body_part} onChange={(event) => setField('target_body_part', event.target.value as BodyPart)}>
              {bodyParts.map((part) => (
                <option key={part} value={part}>{part}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="sessions">Sessions per week</label>
            <input id="sessions" type="number" min={1} max={6} value={profile.sessions_per_week} onChange={(event) => setField('sessions_per_week', event.target.value)} />
            {errors.sessions_per_week && <span className="field-error">{errors.sessions_per_week}</span>}
          </div>
          <div className="field">
            <label htmlFor="goal">Goal</label>
            <select id="goal" value={profile.goal} onChange={(event) => setField('goal', event.target.value as Goal)}>
              {goals.map((goal) => (
                <option key={goal} value={goal}>{goal}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <p className="muted" style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700 }}>Available equipment</p>
          <div className="checkbox-row">
            {equipmentOptions.map((item) => (
              <label key={item} className="chip">
                <input
                  type="checkbox"
                  checked={profile.available_equipment.includes(item)}
                  onChange={() => toggleEquipment(item)}
                />
                {item}
              </label>
            ))}
          </div>
        </div>
      </section>

      <div>
        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? 'Generating...' : 'Generate workout plan'}
        </button>
      </div>
    </form>
  )
}
