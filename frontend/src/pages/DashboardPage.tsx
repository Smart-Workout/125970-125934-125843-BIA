import { useState } from 'react'
import { Activity, Dumbbell, LayoutDashboard, MessageSquare, RefreshCw, UserRound } from 'lucide-react'
import ChartPanel from '../components/ChartPanel'
import ChatPanel from '../components/ChatPanel'
import ExerciseTable from '../components/ExerciseTable'
import KPICard from '../components/KPICard'
import PlanCard from '../components/PlanCard'
import ProbabilityBars from '../components/ProbabilityBars'
import ProfileForm from '../components/ProfileForm'
import { useDashboard } from '../hooks/useDashboard'
import { useHealth } from '../hooks/useHealth'
import { useWorkoutPlan } from '../hooks/useWorkoutPlan'

type Tab = 'overview' | 'profile' | 'plan' | 'chat'

const tabs: Array<{ id: Tab; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'profile', label: 'Profile', icon: UserRound },
  { id: 'plan', label: 'Plan', icon: Dumbbell },
  { id: 'chat', label: 'RAG Chat', icon: MessageSquare },
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const health = useHealth()
  const dashboard = useDashboard()
  const workout = useWorkoutPlan()

  const refreshAll = () => {
    health.refresh()
    dashboard.refresh()
  }

  const backendOnline = health.health?.status === 'ok'
  const modelReadyCount = health.readiness
    ? Number(health.readiness.checks.calorie_model_exists) + Number(health.readiness.checks.intensity_model_exists)
    : 0

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div className="brand-mark">
              <Activity size={20} />
            </div>
            <div>
              <h1 className="brand-title">Smart Workout</h1>
              <p className="brand-subtitle">DSS/BIS Personalized Training Dashboard</p>
            </div>
          </div>
          <div className="topbar-actions">
            <span className="status-pill">
              <span className={`status-dot ${backendOnline ? 'online' : ''}`} />
              {backendOnline ? 'Backend online' : 'Backend offline'}
            </span>
            <button className="icon-button" type="button" onClick={refreshAll}>
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="page">
        <nav className="tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                type="button"
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            )
          })}
        </nav>

        {(health.error || dashboard.error || workout.error) && (
          <div className="error-banner" style={{ marginBottom: 14 }}>
            {health.error || dashboard.error || workout.error}
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="grid">
            <div className="grid kpi-grid">
              <KPICard title="Exercises" value={dashboard.data?.kpis.exercise_count ?? 0} detail="ExerciseDB rows" icon="exercise" loading={dashboard.loading} />
              <KPICard title="Datasets" value={dashboard.data?.kpis.raw_dataset_count ?? 0} detail="Raw data sources" icon="dataset" loading={dashboard.loading} />
              <KPICard title="Backend" value={backendOnline ? 'Online' : 'Offline'} detail={health.health?.version ?? 'Waiting'} icon="server" loading={health.loading} />
              <KPICard title="Models Ready" value={`${modelReadyCount}/2`} detail="Calorie and intensity artifacts" icon="model" loading={health.loading} />
            </div>
            <div className="grid two-column">
              <ChartPanel title="Workout Type Distribution" data={dashboard.data?.workout_type_distribution} loading={dashboard.loading} />
              <ChartPanel title="Body Part Coverage" data={dashboard.data?.body_part_coverage} type="pie" loading={dashboard.loading} />
              <ChartPanel title="Equipment Coverage" data={dashboard.data?.equipment_coverage} loading={dashboard.loading} />
              <ChartPanel title="Nutrition Macro Summary" data={dashboard.data?.nutrition_macro_summary} type="pie" loading={dashboard.loading} />
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="grid two-column">
            <ProfileForm loading={workout.loading} onSubmit={(profile) => workout.submit(profile).then(() => setActiveTab('plan'))} />
            <section className="panel">
              <h3 className="panel-title">Readiness Result</h3>
              {workout.data ? (
                <div className="grid">
                  <KPICard title="Readiness Band" value={workout.data.preprocess.readiness.band} detail={`Score ${workout.data.preprocess.readiness.score}/100`} icon="readiness" />
                  <p style={{ margin: 0, fontWeight: 750 }}>Processed Profile</p>
                  <p className="muted" style={{ margin: 0 }}>BMI: {workout.data.preprocess.processed_profile.bmi} ({workout.data.preprocess.processed_profile.bmi_category})</p>
                  <p className="muted" style={{ margin: 0 }}>Blood pressure: {workout.data.preprocess.processed_profile.systolic_bp}/{workout.data.preprocess.processed_profile.diastolic_bp}</p>
                  <ul style={{ marginTop: 0 }}>
                    {workout.data.preprocess.readiness.factors.map((factor) => (
                      <li key={factor}>{factor}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="muted">Submit the profile form to calculate readiness.</p>
              )}
            </section>
          </div>
        )}

        {activeTab === 'plan' && (
          <div className="grid">
            <div className="grid kpi-grid">
              <KPICard title="Calories" value={workout.data ? workout.data.calories.prediction : '-'} detail={workout.data?.calories.unit ?? 'kcal per hour'} icon="model" />
              <KPICard title="Intensity" value={workout.data?.intensity.predicted_class ?? '-'} detail={workout.data?.intensity.model_name ?? 'No model call yet'} icon="readiness" />
              <KPICard title="Exercises" value={workout.data?.exercises.recommendations.length ?? 0} detail="Recommended matches" icon="exercise" />
              <KPICard title="Plan" value={workout.data?.plan.weekly_schedule.length ?? 0} detail="Sessions generated" icon="plan" />
            </div>
            <div className="grid two-column">
              <section className="panel">
                <h3 className="panel-title">Recommended Exercises</h3>
                <ExerciseTable exercises={workout.data?.exercises.recommendations ?? []} />
              </section>
              <section className="panel">
                <h3 className="panel-title">Intensity Probabilities</h3>
                <ProbabilityBars probabilities={workout.data?.intensity.class_probabilities} />
              </section>
              <section className="panel">
                <h3 className="panel-title">Prediction Explanation</h3>
                {workout.data ? (
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {workout.data.intensity.explanation.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted">Generate a plan to see prediction explanation.</p>
                )}
              </section>
            </div>
            <section className="panel">
              <h3 className="panel-title">Generated Weekly Plan</h3>
              <PlanCard plan={workout.data?.plan ?? null} />
            </section>
          </div>
        )}

        {activeTab === 'chat' && <ChatPanel plan={workout.data?.plan ?? null} />}
      </main>
    </div>
  )
}
