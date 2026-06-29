import { useState } from 'react'
import { Activity, Dumbbell, LayoutDashboard, MessageSquare, RefreshCw, UserRound } from 'lucide-react'
import ChartPanel from '../components/ChartPanel'
import ChatPanel from '../components/ChatPanel'
import ExerciseTable from '../components/ExerciseTable'
import FloatingChatAssistant from '../components/FloatingChatAssistant'
import KPICard from '../components/KPICard'
import LifestyleScatterPanel from '../components/LifestyleScatterPanel'
import PlanCard from '../components/PlanCard'
import ProbabilityBars from '../components/ProbabilityBars'
import ProfileForm from '../components/ProfileForm'
import { useDashboard } from '../hooks/useDashboard'
import { useHealth } from '../hooks/useHealth'
import { useWorkoutPlan } from '../hooks/useWorkoutPlan'

type Tab = 'overview' | 'membership' | 'lifestyle' | 'profile' | 'plan' | 'chat'

const tabs: Array<{ id: Tab; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'membership', label: 'Gym Membership', icon: LayoutDashboard },
  { id: 'lifestyle', label: 'Lifestyle Profiles', icon: LayoutDashboard },
  { id: 'profile', label: 'Profile', icon: UserRound },
  { id: 'plan', label: 'Plan', icon: Dumbbell },
  { id: 'chat', label: 'RAG Chat', icon: MessageSquare },
]

const tabMeta: Record<Tab, { title: string; description: string }> = {
  overview: {
    title: 'Overview',
    description: 'Composite landing view linking the descriptive, predictive, and prescriptive layers of the Smart Workout system.',
  },
  membership: {
    title: 'Gym Membership: Relational View',
    description: 'Star-schema descriptive analytics across users, check-ins, subscription plans, and gym locations.',
  },
  lifestyle: {
    title: 'Lifestyle Profiles',
    description: 'Clustering outputs from the Sleep and Lifestyle dataset that feed the readiness logic used before prediction and plan generation.',
  },
  profile: {
    title: 'User Profile',
    description: 'Collect the current user condition and training intent before the estimation and prediction stages.',
  },
  plan: {
    title: 'Prediction and Plan',
    description: 'Model-backed calorie and intensity prediction, exercise retrieval, and weekly plan assembly.',
  },
  chat: {
    title: 'AI Chat Assistant',
    description: 'Retrieval-grounded explanation panel using the RAG corpus and current plan context.',
  },
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const health = useHealth()
  const dashboard = useDashboard()
  const workout = useWorkoutPlan()
  const readinessChecks = health.readiness?.checks ?? null
  const relational = dashboard.data?.relational_membership
  const lifestyle = dashboard.data?.lifestyle_profiles
  const plan = workout.data?.plan ?? null
  const processedProfile = workout.data?.preprocess.processed_profile ?? null
  const assetStatus = [
    { label: 'Raw datasets', ready: Boolean(readinessChecks?.raw_data_dir_exists) },
    { label: 'ExerciseDB source', ready: Boolean(readinessChecks?.exercise_dataset_exists) },
    { label: 'Calorie model', ready: Boolean(readinessChecks?.calorie_model_exists) },
    { label: 'Intensity model', ready: Boolean(readinessChecks?.intensity_model_exists) },
    { label: 'Chroma store', ready: Boolean(readinessChecks?.chroma_db_dir_exists) },
  ]

  const refreshAll = () => {
    health.refresh()
    dashboard.refresh()
  }

  const backendOnline = health.health?.status === 'ok'
  const modelReadyCount = health.readiness
    ? Number(health.readiness.checks.calorie_model_exists) + Number(health.readiness.checks.intensity_model_exists)
    : 0
  const activeMeta = tabMeta[activeTab]
  const topLocation = relational?.top_locations[0]
  const dominantSubscriptionIndex = relational?.subscription_mix.values.length
    ? relational.subscription_mix.values.indexOf(Math.max(...relational.subscription_mix.values))
    : -1
  const dominantSubscription = dominantSubscriptionIndex >= 0
    ? relational?.subscription_mix.labels[dominantSubscriptionIndex]
    : null
  const dominantCluster = lifestyle?.profile_cards.length
    ? [...lifestyle.profile_cards].sort((a, b) => b.record_count - a.record_count)[0]
    : null
  const totalScheduledExercises = plan?.weekly_schedule.reduce((sum, day) => sum + day.exercises.length, 0) ?? 0
  const firstFocus = plan?.weekly_schedule[0]?.focus ?? null

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
            <button className="primary-button" type="button" onClick={() => setActiveTab('profile')}>
              Run analysis
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-shell">
        <aside className="sidebar">
          <div className="sidebar-section">
            <p className="sidebar-heading">Dashboard Views</p>
            <div className="sidebar-nav">
              {tabs.map((tab, index) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    className={`sidebar-link ${activeTab === tab.id ? 'active' : ''}`}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span className="sidebar-link-index">{index + 1}</span>
                    <Icon size={15} />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
          <div className="sidebar-section">
            <p className="sidebar-heading">Analytics Layer</p>
            <div className="legend-stack">
              <div className="legend-row"><span className="legend-dot descriptive" />Descriptive</div>
              <div className="legend-row"><span className="legend-dot predictive" />Predictive</div>
              <div className="legend-row"><span className="legend-dot prescriptive" />Prescriptive</div>
            </div>
          </div>
        </aside>

        <section className="content-pane">
          <div className="page">
            <section className="page-intro">
              <div>
                <p className="eyebrow">Smart Workout Dashboard</p>
                <h2 className="page-title">{activeMeta.title}</h2>
                <p className="page-description">{activeMeta.description}</p>
              </div>
              <div className="context-pills">
                <span className="status-pill">User profile</span>
                <span className="status-pill">RAG assistant</span>
              </div>
            </section>

        {(health.error || dashboard.error || workout.error) && (
          <div className="error-banner" style={{ marginBottom: 14 }}>
            {health.error || dashboard.error || workout.error}
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="grid">
            <section className="panel">
              <h3 className="panel-title">Implementation Flow</h3>
              <div className="workflow-grid">
                <div className="workflow-step">
                  <span className="workflow-step-index">1</span>
                  <div>
                    <p className="workflow-step-title">Profile preprocessing</p>
                    <p className="muted" style={{ margin: '4px 0 0', fontSize: 12 }}>Validate the user input and compute readiness context.</p>
                  </div>
                </div>
                <div className="workflow-step">
                  <span className="workflow-step-index">2</span>
                  <div>
                    <p className="workflow-step-title">Model prediction</p>
                    <p className="muted" style={{ margin: '4px 0 0', fontSize: 12 }}>Estimate calorie burn and predict workout intensity from saved artifacts.</p>
                  </div>
                </div>
                <div className="workflow-step">
                  <span className="workflow-step-index">3</span>
                  <div>
                    <p className="workflow-step-title">Exercise retrieval</p>
                    <p className="muted" style={{ margin: '4px 0 0', fontSize: 12 }}>Filter ExerciseDB rows by target body part and available equipment.</p>
                  </div>
                </div>
                <div className="workflow-step">
                  <span className="workflow-step-index">4</span>
                  <div>
                    <p className="workflow-step-title">Weekly plan and chat</p>
                    <p className="muted" style={{ margin: '4px 0 0', fontSize: 12 }}>Assemble the final plan and ground questions in the RAG corpus.</p>
                  </div>
                </div>
              </div>
            </section>
            <div className="grid kpi-grid">
              <KPICard title="Exercises" value={dashboard.data?.kpis.exercise_count ?? 0} detail="ExerciseDB rows" icon="exercise" loading={dashboard.loading} />
              <KPICard title="Datasets" value={dashboard.data?.kpis.raw_dataset_count ?? 0} detail="Raw data sources" icon="dataset" loading={dashboard.loading} />
              <KPICard title="Backend" value={backendOnline ? 'Online' : 'Offline'} detail={health.health?.version ?? 'Waiting'} icon="server" loading={health.loading} />
              <KPICard title="Models Ready" value={`${modelReadyCount}/2`} detail="Calorie and intensity artifacts" icon="model" loading={health.loading} />
            </div>
            <section className="panel">
              <h3 className="panel-title">Current Implementation Status</h3>
              <div className="status-grid">
                {assetStatus.map((item) => (
                  <div key={item.label} className="status-card">
                    <span className={`status-chip ${item.ready ? 'ready' : 'pending'}`}>{item.ready ? 'Ready' : 'Pending'}</span>
                    <p className="status-card-title">{item.label}</p>
                  </div>
                ))}
              </div>
            </section>
            <section className="panel">
              <h3 className="panel-title">Active Models</h3>
              <div className="insight-list">
                <div className="insight-item">
                  <p className="insight-label">Calorie prediction model</p>
                  <p className="insight-value">Random Forest Regressor</p>
                </div>
                <div className="insight-item">
                  <p className="insight-label">Intensity classification model</p>
                  <p className="insight-value">XGBoost Classifier</p>
                </div>
              </div>
            </section>
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
                  <div className="sequence-note">
                    This stage is an estimation step based on sleep, stress, blood pressure, heart rate, and BMI. Prediction happens after this stage in the Plan tab.
                  </div>
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

        {activeTab === 'membership' && (
          <div className="grid">
            <div className="grid kpi-grid">
              <KPICard title="Active Members" value={relational?.kpis.active_members ?? 0} detail="Cleaned member dimension" icon="dataset" loading={dashboard.loading} />
              <KPICard title="Avg Check-ins" value={relational?.kpis.avg_checkins_per_member ?? 0} detail="Per member" icon="exercise" loading={dashboard.loading} />
              <KPICard title="Plans" value={relational?.kpis.subscription_plans ?? 0} detail="Subscription options" icon="plan" loading={dashboard.loading} />
              <KPICard title="Locations" value={relational?.kpis.gym_locations ?? 0} detail="Gym locations covered" icon="server" loading={dashboard.loading} />
            </div>
            <div className="grid two-column">
              <section className="panel">
                <h3 className="panel-title">Operational Takeaways</h3>
                <div className="insight-list">
                  <div className="insight-item">
                    <p className="insight-label">Top utilized location</p>
                    <p className="insight-value">{topLocation ? `${topLocation.location} (${topLocation.session_count.toLocaleString()} sessions)` : 'Waiting for data'}</p>
                  </div>
                  <div className="insight-item">
                    <p className="insight-label">Dominant subscription</p>
                    <p className="insight-value">{dominantSubscription ?? 'Waiting for data'}</p>
                  </div>
                  <div className="insight-item">
                    <p className="insight-label">Interpretation</p>
                    <p className="muted" style={{ margin: 0 }}>
                      This view now covers the relational GymDB promise from the proposal: member usage, subscription behavior, workout mix, and location utilization.
                    </p>
                  </div>
                </div>
              </section>
              <section className="panel placeholder-panel">
                <h3 className="panel-title">Tableau Embed Placeholder</h3>
                <p className="muted" style={{ marginTop: 0 }}>
                  Reserved for the final embedded Tableau membership dashboard. Current React charts are used for the working prototype and validation pass.
                </p>
              </section>
            </div>
            <div className="grid two-column">
              <ChartPanel title="Check-in Volume Over Time" data={relational?.monthly_activity} type="line" loading={dashboard.loading} />
              <ChartPanel title="Subscription Mix" data={relational?.subscription_mix} type="pie" loading={dashboard.loading} />
              <ChartPanel title="Sessions by Gym Type" data={relational?.gym_type_session_mix} loading={dashboard.loading} />
              <ChartPanel title="Avg Calories by Workout Type" data={relational?.workout_avg_calories} loading={dashboard.loading} />
            </div>
            <section className="panel">
              <h3 className="panel-title">Top Location Utilization</h3>
              {relational?.top_locations.length ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Location</th>
                        <th>Gym Type</th>
                        <th>Sessions</th>
                        <th>Users</th>
                        <th>Avg Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {relational.top_locations.map((row) => (
                        <tr key={row.gym_id}>
                          <td>{row.location}</td>
                          <td>{row.gym_type}</td>
                          <td>{row.session_count.toLocaleString()}</td>
                          <td>{row.unique_users.toLocaleString()}</td>
                          <td>{row.avg_duration_minutes.toFixed(1)} min</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="muted">No location utilization data available.</p>
              )}
            </section>
          </div>
        )}

        {activeTab === 'lifestyle' && (
          <div className="grid">
            <div className="grid two-column">
              <section className="panel">
                <h3 className="panel-title">Cluster Summary</h3>
                <div className="insight-list">
                  <div className="insight-item">
                    <p className="insight-label">Largest lifestyle archetype</p>
                    <p className="insight-value">
                      {dominantCluster ? `Cluster ${dominantCluster.cluster_id}: ${dominantCluster.label}` : 'Waiting for data'}
                    </p>
                  </div>
                  <div className="insight-item">
                    <p className="insight-label">Readiness implication</p>
                    <p className="muted" style={{ margin: 0 }}>
                      The clustering layer explains why the system treats readiness as a pre-prediction estimation step before calorie and intensity inference.
                    </p>
                  </div>
                </div>
              </section>
              <section className="panel placeholder-panel">
                <h3 className="panel-title">Tableau Embed Placeholder</h3>
                <p className="muted" style={{ marginTop: 0 }}>
                  Reserved for the final lifestyle-profile visual story in Tableau once the embedded dashboard layer is added.
                </p>
              </section>
            </div>
            <div className="grid two-column">
              <LifestyleScatterPanel points={lifestyle?.scatter_points} loading={dashboard.loading} />
              <section className="panel">
                <h3 className="panel-title">Cluster Profile Cards</h3>
                {lifestyle?.profile_cards.length ? (
                  <div className="grid">
                    {lifestyle.profile_cards.map((card) => (
                      <div key={card.cluster_id} className="cluster-card">
                        <p className="cluster-card-title">Cluster {card.cluster_id}: {card.label}</p>
                        <p className="muted" style={{ margin: '6px 0 0' }}>
                          Readiness {card.readiness_score} | Sleep {card.sleep_duration}h | Activity {card.physical_activity_level} | Stress {card.stress_level}
                        </p>
                        <p className="muted" style={{ margin: '6px 0 0', fontSize: 12 }}>
                          {card.record_count} records
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="muted">No cluster profile data available.</p>
                )}
              </section>
            </div>
            <div className="grid three-column">
              <ChartPanel title="Silhouette Scores" data={lifestyle?.silhouette_scores} loading={dashboard.loading} />
              <ChartPanel title="Sleep Duration by Cluster" data={lifestyle?.sleep_duration_by_cluster} loading={dashboard.loading} />
              <ChartPanel title="Activity by Cluster" data={lifestyle?.activity_by_cluster} loading={dashboard.loading} />
              <ChartPanel title="Stress by Cluster" data={lifestyle?.stress_by_cluster} loading={dashboard.loading} />
            </div>
          </div>
        )}

        {activeTab === 'plan' && (
          <div className="grid">
            <section className="panel">
              <h3 className="panel-title">Decision Sequence</h3>
              <div className="status-grid">
                <div className="status-card">
                  <span className="status-chip ready">Estimate</span>
                  <p className="status-card-title">Readiness is estimated from current wellness signals.</p>
                </div>
                <div className="status-card">
                  <span className="status-chip ready">Predict</span>
                  <p className="status-card-title">Intensity and calorie burn are predicted from the saved ML models.</p>
                </div>
                <div className="status-card">
                  <span className="status-chip ready">Retrieve</span>
                  <p className="status-card-title">Exercises are filtered from ExerciseDB and rules are grounded with RAG snippets.</p>
                </div>
                <div className="status-card">
                  <span className="status-chip ready">Assemble</span>
                  <p className="status-card-title">The weekly plan is generated from the predicted intensity and readiness band.</p>
                </div>
              </div>
            </section>
            <div className="grid kpi-grid">
              <KPICard title="Calories" value={workout.data ? workout.data.calories.prediction : '-'} detail={workout.data?.calories.unit ?? 'kcal per hour'} icon="model" />
              <KPICard title="Intensity" value={workout.data?.intensity.predicted_class ?? '-'} detail={workout.data?.intensity.model_name ?? 'No model call yet'} icon="readiness" />
              <KPICard title="Exercises" value={workout.data?.exercises.recommendations.length ?? 0} detail="Recommended matches" icon="exercise" />
              <KPICard title="Plan" value={workout.data?.plan.weekly_schedule.length ?? 0} detail="Sessions generated" icon="plan" />
            </div>
            <div className="grid two-column">
              <section className="panel">
                <h3 className="panel-title">Plan Assembly Summary</h3>
                {plan && processedProfile ? (
                  <div className="insight-list">
                    <div className="insight-item">
                      <p className="insight-label">Goal and focus</p>
                      <p className="insight-value">{processedProfile.goal} with {processedProfile.target_body_part} emphasis</p>
                    </div>
                    <div className="insight-item">
                      <p className="insight-label">Weekly split</p>
                      <p className="insight-value">{plan.weekly_schedule.length} sessions, {totalScheduledExercises} scheduled exercises</p>
                    </div>
                    <div className="insight-item">
                      <p className="insight-label">Opening block</p>
                      <p className="insight-value">{firstFocus ?? 'Waiting for plan generation'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="muted">Generate a plan from the Profile tab to see the final split summary.</p>
                )}
              </section>
              <section className="panel">
                <h3 className="panel-title">Plan Interpretation</h3>
                {workout.data ? (
                  <div className="insight-list">
                    <div className="insight-item">
                      <p className="insight-label">Readiness</p>
                      <p className="insight-value">{workout.data.preprocess.readiness.band} ({workout.data.preprocess.readiness.score}/100)</p>
                    </div>
                    <div className="insight-item">
                      <p className="insight-label">Intensity prediction</p>
                      <p className="insight-value">{workout.data.intensity.predicted_class} via {workout.data.intensity.model_name}</p>
                    </div>
                    <div className="insight-item">
                      <p className="insight-label">Proposal wording</p>
                      <p className="muted" style={{ margin: 0 }}>
                        Readiness is estimated before the predictive models run. Calories and intensity are predictions. The plan is generated after those results are available.
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="muted">Prediction context appears here after the user profile is submitted.</p>
                )}
              </section>
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
          </div>
        </section>
      </main>
      <FloatingChatAssistant plan={workout.data?.plan ?? null} />
    </div>
  )
}
