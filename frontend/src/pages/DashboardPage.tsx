import { useState } from 'react'
import { Activity, Building2, Dumbbell, Home, LayoutDashboard, MessageSquare, RefreshCw, Target, UserRound, Users } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import ChartPanel from '../components/ChartPanel'
import ChatPanel from '../components/ChatPanel'
import DecisionMappingPanel from '../components/DecisionMappingPanel'
import EngagementScatter from '../components/EngagementScatter'
import ExerciseTable from '../components/ExerciseTable'
import FloatingChatAssistant from '../components/FloatingChatAssistant'
import KPICard from '../components/KPICard'
import LifestyleScatterPanel from '../components/LifestyleScatterPanel'
import Neo4JSourceGraph from '../components/Neo4JSourceGraph'
import PlanCard from '../components/PlanCard'
import ProbabilityBars from '../components/ProbabilityBars'
import ProfileForm from '../components/ProfileForm'
import ShapImpactPanel from '../components/ShapImpactPanel'
import UsageHeatmap from '../components/UsageHeatmap'
import { useDashboard } from '../hooks/useDashboard'
import { useHealth } from '../hooks/useHealth'
import { useWorkoutPlan } from '../hooks/useWorkoutPlan'
import type { ChartData, LifestyleProfileCard, RelationalLocationRow, SubscriptionTierDashboard } from '../types/dashboard.types'

type Tab = 'overview' | 'membership' | 'lifestyle' | 'profile' | 'plan' | 'chat'
type AudienceMode = 'user' | 'executive'
type MembershipTier = 'basic' | 'advanced'
type MonthSelectionMode = 'range' | 'specific'
type WorkspaceView = 'executive' | 'user' | 'nutrition' | 'exercise'

const executiveTabs: Array<{ id: Tab; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard },
  { id: 'membership', label: 'Membership Analytics', icon: Building2 },
  { id: 'lifestyle', label: 'Lifestyle Segments', icon: Users },
  { id: 'plan', label: 'Plan Readiness', icon: Target },
]

const userTabs: Array<{ id: Tab; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'profile', label: 'My Profile', icon: UserRound },
  { id: 'plan', label: 'My Weekly Plan', icon: Dumbbell },
  { id: 'chat', label: 'Plan Assistant', icon: MessageSquare },
]

const tabMeta: Record<Tab, { title: string; description: string }> = {
  overview: {
    title: 'Executive Overview: Priority Action Center',
    description: 'Top-level decision view connecting membership utilization, lifestyle readiness, and plan performance signals.',
  },
  membership: {
    title: 'Membership Utilization and Revenue Signals',
    description: 'Location and subscription cohort analytics for utilization, promotion targeting, and service adjustment decisions.',
  },
  lifestyle: {
    title: 'Lifestyle Readiness Segments',
    description: 'Clustered wellness profiles showing readiness, recovery risk, sleep, activity, and stress patterns.',
  },
  profile: {
    title: 'Client Profile and Readiness Inputs',
    description: 'Client-facing form for goals, constraints, wellness status, and safety-aware readiness estimation.',
  },
  plan: {
    title: 'Personalized Prediction and Weekly Plan',
    description: 'Model-backed intensity, planned-session calories, exercise retrieval, and weekly programming.',
  },
  chat: {
    title: 'Plan Rationale Assistant',
    description: 'Client-facing retrieval-grounded assistant for explaining the generated plan and supporting evidence.',
  },
}

const audienceDefaults: Record<AudienceMode, Tab> = {
  user: 'profile',
  executive: 'overview',
}

const membershipTierOptions: Array<{ id: MembershipTier; label: string; detail: string }> = [
  { id: 'basic', label: 'Basic Users', detail: 'Basic + Student subscriptions' },
  { id: 'advanced', label: 'Advanced Users', detail: 'Pro subscription' },
]

const workspaceViewOptions: Array<{ id: WorkspaceView; label: string }> = [
  { id: 'executive', label: 'Executive summary' },
  { id: 'user', label: 'Member profile analytics' },
  { id: 'nutrition', label: 'Nutrition planning data' },
  { id: 'exercise', label: 'Exercise plan analytics' },
]

const formatCurrency = (value?: number) => `$${Math.round(value ?? 0).toLocaleString()}`
const formatNumber = (value?: number) => Math.round(value ?? 0).toLocaleString()
const formatCalorieUnit = (unit?: string) => {
  if (unit === 'kcal_per_planned_session') return 'kcal per planned session'
  if (unit === 'kcal_per_hour') return 'kcal per hour'
  return unit?.replace(/_/g, ' ') ?? 'kcal per planned session'
}

const combineCharts = (charts: ChartData[]): ChartData => {
  const totals = new Map<string, number>()
  charts.forEach((chart) => {
    chart.labels.forEach((label, index) => {
      totals.set(label, (totals.get(label) ?? 0) + (chart.values[index] ?? 0))
    })
  })
  const rows = [...totals.entries()]
  return { labels: rows.map(([label]) => label), values: rows.map(([, value]) => value) }
}

const combineLocationRows = (tiers: SubscriptionTierDashboard[]): RelationalLocationRow[] => {
  const rows = new Map<string, RelationalLocationRow & { duration_weight: number }>()
  tiers.forEach((tier) => {
    tier.top_locations.forEach((location) => {
      const key = `${location.gym_id}-${location.location}-${location.gym_type}`
      const current = rows.get(key) ?? { ...location, session_count: 0, unique_users: 0, avg_duration_minutes: 0, duration_weight: 0 }
      current.session_count += location.session_count
      current.unique_users += location.unique_users
      current.duration_weight += location.avg_duration_minutes * location.session_count
      current.avg_duration_minutes = current.session_count ? current.duration_weight / current.session_count : 0
      rows.set(key, current)
    })
  })
  return [...rows.values()]
    .sort((a, b) => b.session_count - a.session_count)
    .slice(0, 8)
    .map(({ duration_weight: _durationWeight, ...row }) => ({ ...row, avg_duration_minutes: Number(row.avg_duration_minutes.toFixed(2)) }))
}

const clusterDecisionLabel = (card: LifestyleProfileCard) => {
  if (card.readiness_score >= 80 && card.stress_level <= 4) return 'Performance-ready users'
  if (card.readiness_score >= 65) return 'Stable habit users'
  if (card.sleep_duration < 6.5 || card.stress_level >= 7) return 'Recovery-risk users'
  return 'Habit-building users'
}

const clusterDecisionAction = (card: LifestyleProfileCard) => {
  if (card.readiness_score >= 80 && card.physical_activity_level >= 55) return 'Can receive higher volume and progression nudges.'
  if (card.stress_level >= 7 || card.sleep_duration < 6.5) return 'Needs recovery-first plan, lighter intensity, and sleep/stress coaching.'
  if (card.physical_activity_level < 45) return 'Needs adherence support and beginner-friendly weekly goals.'
  return 'Use balanced progression with normal readiness checks.'
}

interface DashboardPageProps {
  initialAudience?: AudienceMode
}

export default function DashboardPage({ initialAudience = 'user' }: DashboardPageProps) {
  const navigate = useNavigate()
  const [audienceMode, setAudienceMode] = useState<AudienceMode>(initialAudience)
  const [activeTab, setActiveTab] = useState<Tab>(audienceDefaults[initialAudience])
  const [selectedMembershipTiers, setSelectedMembershipTiers] = useState<MembershipTier[]>(['basic', 'advanced'])
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>('executive')
  const [monthSelectionMode, setMonthSelectionMode] = useState<MonthSelectionMode>('range')
  const [startMonth, setStartMonth] = useState('')
  const [endMonth, setEndMonth] = useState('')
  const [selectedMonths, setSelectedMonths] = useState<string[]>([])
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [selectedGender, setSelectedGender] = useState('')
  const health = useHealth()
  const dashboard = useDashboard({
    start_month: monthSelectionMode === 'range' ? startMonth : undefined,
    end_month: monthSelectionMode === 'range' ? endMonth : undefined,
    months: monthSelectionMode === 'specific' ? selectedMonths : undefined,
    locations: selectedLocations,
    gender: selectedGender,
  })
  const workout = useWorkoutPlan()
  const relational = dashboard.data?.relational_membership
  const lifestyle = dashboard.data?.lifestyle_profiles
  const workspace = dashboard.data?.dashboard_workspace
  const filters = workspace?.filter_options
  const executive = workspace?.executive_summary
  const userInfo = workspace?.user_info
  const nutrition = workspace?.nutrition_plan
  const exerciseDashboard = workspace?.exercise_plan
  const plan = workout.data?.plan ?? null
  const processedProfile = workout.data?.preprocess.processed_profile ?? null
  const refreshAll = () => {
    health.refresh()
    dashboard.refresh()
  }

  const backendOnline = health.health?.status === 'ok'
  const activeMeta = audienceMode === 'executive' && activeTab === 'plan'
    ? {
        title: 'Plan Readiness and Model Governance',
        description: 'Executive view of readiness mapping, predicted intensity, planned-session calories, model explainability, and program output quality.',
      }
    : tabMeta[activeTab]
  const visibleTabs = audienceMode === 'executive' ? executiveTabs : userTabs
  const topLocation = relational?.top_locations[0]
  const selectedTiers = relational?.tier_dashboards.filter((item) => selectedMembershipTiers.includes(item.tier)) ?? []
  const selectedTierPlans = relational?.plan_breakdown.filter((item) => selectedMembershipTiers.includes(item.tier)) ?? []
  const selectedTierSessions = selectedTiers.reduce((sum, tier) => sum + tier.sampled_sessions, 0)
  const selectedTierMembers = selectedTiers.reduce((sum, tier) => sum + tier.member_count, 0)
  const selectedTierMrr = selectedTiers.reduce((sum, tier) => sum + tier.estimated_monthly_recurring_revenue, 0)
  const selectedMemberShare = selectedTiers.reduce((sum, tier) => sum + tier.member_share, 0)
  const selectedSessionShare = selectedTiers.reduce((sum, tier) => sum + tier.session_share, 0)
  const selectedAvgCheckins = selectedTierMembers ? Number((selectedTierSessions / selectedTierMembers).toFixed(1)) : 0
  const selectedAvgDuration = selectedTierSessions
    ? selectedTiers.reduce((sum, tier) => sum + tier.avg_duration_minutes * tier.sampled_sessions, 0) / selectedTierSessions
    : 0
  const selectedAvgCalories = selectedTierSessions
    ? selectedTiers.reduce((sum, tier) => sum + tier.avg_calories_per_session * tier.sampled_sessions, 0) / selectedTierSessions
    : 0
  const selectedTierTitle = selectedTiers.length === 1 ? selectedTiers[0].title : 'Selected Subscription Groups'
  const selectedTierSubscriptions = [...new Set(selectedTiers.flatMap((tier) => tier.included_subscriptions))]
  const selectedMonthlyActivity = combineCharts(selectedTiers.map((tier) => tier.monthly_activity))
  const selectedWorkoutMix = combineCharts(selectedTiers.map((tier) => tier.workout_mix))
  const selectedTopWorkoutIndex = selectedWorkoutMix.values.length ? selectedWorkoutMix.values.indexOf(Math.max(...selectedWorkoutMix.values)) : -1
  const selectedTopWorkout = selectedTopWorkoutIndex >= 0 ? selectedWorkoutMix.labels[selectedTopWorkoutIndex] : 'Waiting for data'
  const selectedLocationRows = combineLocationRows(selectedTiers)
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
  const months = filters?.months ?? []
  const monthMax = Math.max(months.length - 1, 0)
  const startMonthIndex = startMonth && months.includes(startMonth) ? months.indexOf(startMonth) : 0
  const endMonthIndex = endMonth && months.includes(endMonth) ? months.indexOf(endMonth) : monthMax
  const displayStartMonthIndex = Math.min(startMonthIndex, endMonthIndex)
  const displayEndMonthIndex = Math.max(startMonthIndex, endMonthIndex)
  const displayStartMonth = months[displayStartMonthIndex] ?? 'All'
  const displayEndMonth = months[displayEndMonthIndex] ?? 'All'
  const selectedMonthLabel = selectedMonths.length
    ? `${selectedMonths.length} month${selectedMonths.length === 1 ? '' : 's'} selected`
    : 'All months'

  const setAudience = (mode: AudienceMode) => {
    setAudienceMode(mode)
    setActiveTab(audienceDefaults[mode])
    navigate(mode === 'user' ? '/user' : '/executive')
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
  }

  const toggleMembershipTier = (tier: MembershipTier) => {
    setSelectedMembershipTiers((current) => {
      if (current.includes(tier)) {
        return current.length === 1 ? current : current.filter((item) => item !== tier)
      }
      return [...current, tier]
    })
  }

  const toggleLocation = (locationName: string) => {
    setSelectedLocations((current) => (
      current.includes(locationName)
        ? current.filter((item) => item !== locationName)
        : [...current, locationName]
    ))
  }

  const toggleMonth = (month: string) => {
    setSelectedMonths((current) => (
      current.includes(month)
        ? current.filter((item) => item !== month)
        : [...current, month].sort()
    ))
  }

  const executivePriorities = [
    {
      label: 'Utilization priority',
      value: topLocation ? topLocation.location : 'Waiting for location data',
      detail: topLocation
        ? `${formatNumber(topLocation.session_count)} sampled sessions at ${topLocation.gym_type}`
        : 'Use location check-ins to prioritize staffing and facility planning.',
    },
    {
      label: 'Membership focus',
      value: dominantSubscription ?? 'Waiting for subscription data',
      detail: `${formatNumber(selectedTierMembers)} selected members across ${selectedTierSubscriptions.join(', ') || 'all plans'}`,
    },
    {
      label: 'Lifestyle risk signal',
      value: dominantCluster ? `Cluster ${dominantCluster.cluster_id}` : 'Waiting for cluster data',
      detail: dominantCluster
        ? `${dominantCluster.label}: readiness ${dominantCluster.readiness_score}/100, stress ${dominantCluster.stress_level}`
        : 'Use readiness clusters to identify wellness intervention needs.',
    },
    {
      label: 'Plan readiness signal',
      value: workout.data ? `${workout.data.plan.decision_mapping.recommendation_level}` : 'Profile not generated',
      detail: workout.data
        ? `${workout.data.preprocess.readiness.band} readiness, ${workout.data.intensity.predicted_class} intensity, score ${workout.data.plan.decision_mapping.combined_training_score}/100`
        : 'Generate a client profile on User Side to activate predictive and prescriptive plan signals.',
    },
  ]

  const clientJourney = [
    {
      label: '1. Capture profile',
      detail: 'Age, body metrics, sleep, stress, blood pressure, heart rate, goal, equipment, and weekly frequency.',
    },
    {
      label: '2. Estimate readiness',
      detail: 'Wellness and safety signals produce a readiness score before prediction is used.',
    },
    {
      label: '3. Predict and assemble',
      detail: 'The model predicts intensity and planned-session calories, then builds the weekly exercise program.',
    },
  ]

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <Link className="brand-mark brand-home-link" to="/" aria-label="Back to home">
              <Activity size={20} />
            </Link>
            <div>
              <h1 className="brand-title">Smart Workout</h1>
              <p className="brand-subtitle">{audienceMode === 'executive' ? 'Executive workspace' : 'User planning workspace'}</p>
            </div>
          </div>
          <div className="topbar-actions">
            <Link className="icon-button nav-link-button" to="/">
              <Home size={15} />
              Home
            </Link>
            <div className="topbar-audience-switch" aria-label="Audience selector">
              <button className={audienceMode === 'user' ? 'active' : ''} type="button" onClick={() => setAudience('user')}>User</button>
              <button className={audienceMode === 'executive' ? 'active' : ''} type="button" onClick={() => setAudience('executive')}>Executive</button>
            </div>
            <span className="status-pill">
              <span className={`status-dot ${backendOnline ? 'online' : ''}`} />
              {backendOnline ? 'Backend online' : 'Backend offline'}
            </span>
            <button className="icon-button" type="button" onClick={refreshAll}>
              <RefreshCw size={15} />
              Refresh
            </button>
            <button className="primary-button" type="button" onClick={() => setAudience('user')}>
              <Dumbbell size={15} />
              New plan
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-shell">
        <aside className="sidebar">
          <div className="sidebar-section">
            <p className="sidebar-heading">{audienceMode === 'executive' ? 'Executive Views' : 'User Views'}</p>
            <div className="sidebar-nav">
              {visibleTabs.map((tab, index) => {
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
            <p className="sidebar-heading">{audienceMode === 'executive' ? 'Analytics Layer' : 'Client Journey'}</p>
            {audienceMode === 'executive' ? (
              <div className="legend-stack">
                <div className="legend-row"><span className="legend-dot descriptive" />Descriptive analytics</div>
                <div className="legend-row"><span className="legend-dot predictive" />Predictive model signal</div>
                <div className="legend-row"><span className="legend-dot prescriptive" />Prescriptive plan action</div>
              </div>
            ) : (
              <div className="legend-stack">
                <div className="legend-row"><span className="legend-dot descriptive" />Profile capture</div>
                <div className="legend-row"><span className="legend-dot predictive" />Intensity prediction</div>
                <div className="legend-row"><span className="legend-dot prescriptive" />Weekly plan</div>
              </div>
            )}
          </div>
        </aside>

        <section className="content-pane">
          <div className="page">
            <section className="page-intro">
              <div>
                <p className="eyebrow">{audienceMode === 'executive' ? 'Internal Analytics Workspace' : 'Client Plan Workspace'}</p>
                <h2 className="page-title">{activeMeta.title}</h2>
                <p className="page-description">{activeMeta.description}</p>
              </div>
              <div className="context-pills">
                <span className="status-pill">{audienceMode === 'executive' ? 'Business decision support' : 'Client guidance'}</span>
                <span className="status-pill">{audienceMode === 'executive' ? 'Data analytics insight' : 'Personalized plan'}</span>
              </div>
            </section>

        {(health.error || dashboard.error || workout.error) && (
          <div className="error-banner" style={{ marginBottom: 14 }}>
            {health.error || dashboard.error || workout.error}
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="grid">
            <section className="panel workspace-controls">
              <div className="field">
                <label htmlFor="workspace-view">Dashboard view</label>
                <select id="workspace-view" value={workspaceView} onChange={(event) => setWorkspaceView(event.target.value as WorkspaceView)}>
                  {workspaceViewOptions.map((option) => (
                    <option key={option.id} value={option.id}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div className="field date-range-field">
                <label>Date controls</label>
                <div className="date-range-slicer">
                  <div className="month-mode-toggle" aria-label="Month selection mode">
                    <button className={monthSelectionMode === 'range' ? 'active' : ''} type="button" onClick={() => setMonthSelectionMode('range')}>Between range</button>
                    <button className={monthSelectionMode === 'specific' ? 'active' : ''} type="button" onClick={() => setMonthSelectionMode('specific')}>Specific months</button>
                  </div>
                  {monthSelectionMode === 'range' ? (
                    <>
                      <div className="date-range-labels">
                        <span>{displayStartMonth}</span>
                        <span>{displayEndMonth}</span>
                      </div>
                      <div className="range-track-stack">
                        <input
                          aria-label="Start month"
                          type="range"
                          min={0}
                          max={monthMax}
                          value={displayStartMonthIndex}
                          disabled={months.length === 0}
                          onChange={(event) => {
                            const nextIndex = Math.min(Number(event.target.value), displayEndMonthIndex)
                            setStartMonth(months[nextIndex] ?? '')
                          }}
                        />
                        <input
                          aria-label="End month"
                          type="range"
                          min={0}
                          max={monthMax}
                          value={displayEndMonthIndex}
                          disabled={months.length === 0}
                          onChange={(event) => {
                            const nextIndex = Math.max(Number(event.target.value), displayStartMonthIndex)
                            setEndMonth(months[nextIndex] ?? '')
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="month-picker">
                      <div className="slicer-heading-row">
                        <span className="month-picker-summary">{selectedMonthLabel}</span>
                        <button className="text-button" type="button" onClick={() => setSelectedMonths([])}>All</button>
                      </div>
                      <div className="month-chip-grid">
                        {months.map((month) => (
                          <label key={month} className={`month-chip ${selectedMonths.includes(month) ? 'active' : ''}`}>
                            <input type="checkbox" checked={selectedMonths.includes(month)} onChange={() => toggleMonth(month)} />
                            <span>{month}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="field location-slicer">
                <div className="slicer-heading-row">
                  <label>Location</label>
                  <button className="text-button" type="button" onClick={() => setSelectedLocations([])}>All</button>
                </div>
                <div className="location-checkbox-grid">
                  {filters?.locations.map((locationName) => (
                    <label key={locationName} className={`location-checkbox ${selectedLocations.includes(locationName) ? 'active' : ''}`}>
                      <input
                        type="checkbox"
                        checked={selectedLocations.includes(locationName)}
                        onChange={() => toggleLocation(locationName)}
                      />
                      <span>{locationName}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="field">
                <label htmlFor="gender-filter">Gender</label>
                <select id="gender-filter" value={selectedGender} onChange={(event) => setSelectedGender(event.target.value)}>
                  <option value="">All</option>
                  {filters?.genders.map((genderName) => <option key={genderName} value={genderName}>{genderName}</option>)}
                </select>
              </div>
            </section>

            <section className="priority-grid">
              {executivePriorities.map((item) => (
                <article key={item.label} className="priority-card">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                  <p>{item.detail}</p>
                </article>
              ))}
            </section>

            {workspaceView === 'executive' && (
              <div className="grid">
                <div className="grid kpi-grid">
                  <KPICard title="Sessions" value={executive?.kpis.selected_sessions ?? 0} detail="Filtered check-ins" icon="exercise" loading={dashboard.loading} />
                  <KPICard title="Users" value={executive?.kpis.selected_users ?? 0} detail="Unique users in filter" icon="dataset" loading={dashboard.loading} />
                  <KPICard title="Avg Duration" value={`${executive?.kpis.avg_duration_minutes ?? 0} min`} detail="Per session" icon="server" loading={dashboard.loading} />
                  <KPICard title="Avg Calories" value={executive?.kpis.avg_calories ?? 0} detail="Per session" icon="model" loading={dashboard.loading} />
                </div>
                <div className="grid two-column">
                  <ChartPanel title="Monthly Utilization Trend (Filtered Check-ins)" subtitle="Shows whether selected locations and cohorts are expanding, stable, or softening over time." data={executive?.monthly_activity} type="line" loading={dashboard.loading} />
                  <ChartPanel title="Training Demand Mix by Workout Type" subtitle="Identifies which training formats are driving program demand." data={executive?.workout_mix} loading={dashboard.loading} />
                  <ChartPanel title="Member Gender Composition in Selected Filter" subtitle="Context for comparing behavior across gender segments." data={executive?.gender_mix} type="pie" loading={dashboard.loading} />
                  <ChartPanel title="Location Contribution to Selected Utilization" subtitle="Highlights which branches carry the selected demand." data={executive?.location_mix} loading={dashboard.loading} />
                </div>
                <div className="grid two-column">
                  <UsageHeatmap cells={executive?.usage_heatmap} />
                  <EngagementScatter points={executive?.engagement_scatter} />
                </div>
              </div>
            )}

            {workspaceView === 'user' && (
              <div className="grid">
                <div className="grid kpi-grid">
                  <KPICard title="Filtered Users" value={userInfo?.kpis.unique_users ?? 0} detail="Unique users" icon="dataset" loading={dashboard.loading} />
                  <KPICard title="Avg Age" value={userInfo?.kpis.avg_age ?? 0} detail="Filtered user profile" icon="readiness" loading={dashboard.loading} />
                  <KPICard title="Sessions/User" value={userInfo?.kpis.avg_sessions_per_user ?? 0} detail="Within selected filter" icon="exercise" loading={dashboard.loading} />
                  <KPICard title="Plans" value={userInfo?.kpis.subscription_types ?? 0} detail="Subscription types" icon="plan" loading={dashboard.loading} />
                </div>
                <div className="grid two-column">
                  <ChartPanel title="Filtered User Gender Mix" data={userInfo?.gender_mix} type="pie" loading={dashboard.loading} />
                  <ChartPanel title="Filtered User Age Bands" data={userInfo?.age_group_mix} loading={dashboard.loading} />
                  <ChartPanel title="Subscription Plan Mix for Selected Users" data={userInfo?.subscription_mix} type="pie" loading={dashboard.loading} />
                  <ChartPanel title="Top Home Locations for Selected Users" data={userInfo?.top_user_locations} loading={dashboard.loading} />
                </div>
                <section className="panel">
                  <h3 className="panel-title">User Detail Sample</h3>
                  {userInfo?.sample_users.length ? (
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>User</th>
                            <th>Age</th>
                            <th>Gender</th>
                            <th>Location</th>
                            <th>Plan</th>
                            <th>Sessions</th>
                            <th>Avg Calories</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userInfo.sample_users.map((row) => (
                            <tr key={row.user_id}>
                              <td>{row.user_id}</td>
                              <td>{row.age}</td>
                              <td>{row.gender}</td>
                              <td>{row.user_location}</td>
                              <td>{row.subscription_plan}</td>
                              <td>{row.session_count}</td>
                              <td>{row.avg_calories.toFixed(0)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="muted">No user rows match the selected filters.</p>
                  )}
                </section>
              </div>
            )}

            {workspaceView === 'nutrition' && (
              <div className="grid">
                <div className="grid kpi-grid">
                  <KPICard title="Food Items" value={nutrition?.kpis.food_items ?? 0} detail="Nutrition rows" icon="dataset" loading={dashboard.loading} />
                  <KPICard title="Avg Calories" value={nutrition?.kpis.avg_calories ?? 0} detail="Per item" icon="model" loading={dashboard.loading} />
                  <KPICard title="Avg Protein" value={`${nutrition?.kpis.avg_protein_g ?? 0} g`} detail="Per item" icon="exercise" loading={dashboard.loading} />
                  <KPICard title="Avg Water" value={`${nutrition?.kpis.avg_water_ml ?? 0} ml`} detail="Per item" icon="readiness" loading={dashboard.loading} />
                </div>
                <div className="grid two-column">
                  <ChartPanel title="Nutrition Macro Mix for Plan Support" data={nutrition?.macro_mix} type="pie" loading={dashboard.loading} />
                  <ChartPanel title="Calorie Supply by Meal Type" data={nutrition?.meal_calories} loading={dashboard.loading} />
                  <ChartPanel title="Protein Supply by Meal Type" data={nutrition?.meal_protein} loading={dashboard.loading} />
                  <section className="panel">
                    <h3 className="panel-title">High-Protein Food Candidates</h3>
                    {nutrition?.top_protein_foods.length ? (
                      <div className="table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th>Food</th>
                              <th>Meal</th>
                              <th>Calories</th>
                              <th>Protein</th>
                            </tr>
                          </thead>
                          <tbody>
                            {nutrition.top_protein_foods.map((row) => (
                              <tr key={`${row.food_item}-${row.meal_type}`}>
                                <td>{row.food_item}</td>
                                <td>{row.meal_type}</td>
                                <td>{row.calories.toFixed(0)}</td>
                                <td>{row.protein_g.toFixed(1)} g</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="muted">No nutrition rows available.</p>
                    )}
                  </section>
                </div>
              </div>
            )}

            {workspaceView === 'exercise' && (
              <div className="grid">
                <div className="grid kpi-grid">
                  <KPICard title="Sessions" value={exerciseDashboard?.kpis.selected_sessions ?? 0} detail="Filtered exercise sessions" icon="exercise" loading={dashboard.loading} />
                  <KPICard title="Workout Types" value={exerciseDashboard?.kpis.workout_types ?? 0} detail="Filtered workouts" icon="dataset" loading={dashboard.loading} />
                  <KPICard title="Avg Calories" value={exerciseDashboard?.kpis.avg_calories ?? 0} detail="Per session" icon="model" loading={dashboard.loading} />
                  <KPICard title="Avg Duration" value={`${exerciseDashboard?.kpis.avg_duration_minutes ?? 0} min`} detail="Per session" icon="server" loading={dashboard.loading} />
                </div>
                <div className="grid two-column">
                  <ChartPanel title="Exercise Session Mix by Workout Type" data={exerciseDashboard?.workout_mix} loading={dashboard.loading} />
                  <ChartPanel title="Average Calories by Workout Type" data={exerciseDashboard?.calories_by_workout} loading={dashboard.loading} />
                  <ChartPanel title="Average Duration by Workout Type" data={exerciseDashboard?.duration_by_workout} loading={dashboard.loading} />
                  <ChartPanel title="ExerciseDB Equipment Coverage for Plan Assembly" data={exerciseDashboard?.equipment_coverage} loading={dashboard.loading} />
                </div>
                <ShapImpactPanel rows={exerciseDashboard?.shap_summary} />
                <div className="grid two-column">
                  <section className="panel">
                    <h3 className="panel-title">Neo4J Graph: Readiness Source</h3>
                    <Neo4JSourceGraph graph={workspace?.source_graphs.readiness} />
                  </section>
                  <section className="panel">
                    <h3 className="panel-title">Neo4J Graph: Intensity Source</h3>
                    <Neo4JSourceGraph graph={workspace?.source_graphs.intensity} />
                  </section>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="grid">
            <section className="client-journey-grid">
              {clientJourney.map((item) => (
                <article key={item.label} className="client-journey-card">
                  <strong>{item.label}</strong>
                  <p>{item.detail}</p>
                </article>
              ))}
            </section>
            <div className="grid two-column">
              <ProfileForm loading={workout.loading} onSubmit={(profile) => workout.submit(profile).then(() => setActiveTab('plan'))} />
              <div className="grid">
                <DecisionMappingPanel
                  readiness={workout.data?.preprocess.readiness ?? null}
                  intensity={workout.data?.intensity ?? null}
                  mapping={workout.data?.plan.decision_mapping ?? null}
                />
                {workout.data ? (
                  <section className="panel">
                    <h3 className="panel-title">Processed Profile and Readiness Explanation</h3>
                    <KPICard title="Readiness Band" value={workout.data.preprocess.readiness.band} detail={`Score ${workout.data.preprocess.readiness.score}/100`} icon="readiness" />
                    <div className="sequence-note">
                      This stage estimates readiness from sleep, stress, blood pressure, resting heart rate, and BMI before the prediction stage generates intensity and calories.
                    </div>
                    <p className="muted" style={{ margin: 0 }}>BMI: {workout.data.preprocess.processed_profile.bmi} ({workout.data.preprocess.processed_profile.bmi_category})</p>
                    <p className="muted" style={{ margin: 0 }}>Blood pressure: {workout.data.preprocess.processed_profile.systolic_bp}/{workout.data.preprocess.processed_profile.diastolic_bp}</p>
                    <ul style={{ marginTop: 0 }}>
                      {workout.data.preprocess.readiness.factors.map((factor) => (
                        <li key={factor}>{factor}</li>
                      ))}
                    </ul>
                  </section>
                ) : (
                  <section className="panel">
                    <h3 className="panel-title">Readiness Preview</h3>
                    <p className="muted">Submit the profile form to calculate readiness, intensity, calories, and the weekly plan.</p>
                  </section>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'membership' && (
          <div className="grid">
            <section className="panel tier-selector-panel">
              <div>
                <h3 className="panel-title">Choose Subscription Dashboards</h3>
                <p className="muted panel-subtitle">
                  Select one or both groups. The dashboard aggregates only the selected subscription groups for comparison and decision making.
                </p>
              </div>
              <div className="tier-toggle">
                {membershipTierOptions.map((option) => (
                  <button
                    key={option.id}
                    className={`tier-toggle-button ${selectedMembershipTiers.includes(option.id) ? 'active' : ''}`}
                    type="button"
                    onClick={() => toggleMembershipTier(option.id)}
                    aria-pressed={selectedMembershipTiers.includes(option.id)}
                  >
                    <span>{option.label}</span>
                    <small>{option.detail}</small>
                  </button>
                ))}
              </div>
            </section>

            <div className="grid kpi-grid">
              <KPICard title="Members" value={formatNumber(selectedTierMembers)} detail={`${selectedMemberShare.toFixed(1)}% of members`} icon="dataset" loading={dashboard.loading} />
              <KPICard title="Sample Sessions" value={formatNumber(selectedTierSessions)} detail={`${selectedSessionShare.toFixed(1)}% of sampled visits`} icon="exercise" loading={dashboard.loading} />
              <KPICard title="Estimated MRR" value={formatCurrency(selectedTierMrr)} detail="Selected subscription revenue" icon="plan" loading={dashboard.loading} />
              <KPICard title="Avg Check-ins" value={selectedAvgCheckins} detail="Per member in session sample" icon="server" loading={dashboard.loading} />
            </div>
            <div className="grid two-column">
              <section className="panel">
                <h3 className="panel-title">{selectedTierTitle} Takeaways</h3>
                <div className="insight-list">
                  <div className="insight-item">
                    <p className="insight-label">Included subscriptions</p>
                    <div className="focus-chip-row">
                      {selectedTierSubscriptions.map((planName) => (
                        <span key={planName} className="focus-chip">{planName}</span>
                      ))}
                      {selectedTierSubscriptions.length === 0 && <span className="muted">Waiting for data</span>}
                    </div>
                  </div>
                  <div className="insight-item">
                    <p className="insight-label">Top workout type</p>
                    <p className="insight-value">{selectedTopWorkout}</p>
                  </div>
                  <div className="insight-item">
                    <p className="insight-label">Mapping rule</p>
                    <div className="tier-note-stack">
                      {selectedTiers.map((tier) => (
                        <p key={tier.tier} className="muted" style={{ margin: 0 }}>{tier.membership_note}</p>
                      ))}
                      {selectedTiers.length === 0 && <p className="muted" style={{ margin: 0 }}>Waiting for subscription-tier data.</p>}
                    </div>
                  </div>
                </div>
              </section>
              <section className="panel">
                <h3 className="panel-title">Subscription Plan Breakdown</h3>
                {selectedTierPlans.length ? (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Plan</th>
                          <th>Members</th>
                          <th>Price</th>
                          <th>Estimated MRR</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedTierPlans.map((row) => (
                          <tr key={row.subscription_plan}>
                            <td>{row.subscription_plan}</td>
                            <td>{row.user_count.toLocaleString()}</td>
                            <td>{formatCurrency(row.price_per_month)}</td>
                            <td>{formatCurrency(row.estimated_monthly_recurring_revenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="muted">No plan rows available for this tier.</p>
                )}
              </section>
            </div>
            <div className="grid two-column">
              <ChartPanel title={`${selectedTierTitle} Monthly Check-in Trend`} subtitle="Used to inspect expansion momentum or potential churn risk by selected subscription group." data={selectedMonthlyActivity} type="line" loading={dashboard.loading} />
              <ChartPanel title={`${selectedTierTitle} Workout Demand Mix`} subtitle="Shows training services used most by the selected subscription group." data={selectedWorkoutMix} loading={dashboard.loading} />
              <ChartPanel title="All Subscription Mix Reference" subtitle="Baseline member composition across every plan for comparison." data={relational?.subscription_mix} type="pie" loading={dashboard.loading} />
              <section className="panel">
                <h3 className="panel-title">Usage Quality</h3>
                <div className="insight-list">
                  <div className="insight-item">
                    <p className="insight-label">Average duration</p>
                    <p className="insight-value">{selectedAvgDuration.toFixed(1)} min/session</p>
                  </div>
                  <div className="insight-item">
                    <p className="insight-label">Average calories</p>
                    <p className="insight-value">{selectedAvgCalories.toFixed(0)} kcal/session</p>
                  </div>
                  <div className="insight-item">
                    <p className="insight-label">Overall context</p>
                    <p className="muted" style={{ margin: 0 }}>
                      Overall top location: {topLocation ? `${topLocation.location} (${topLocation.session_count.toLocaleString()} sessions)` : 'waiting for data'}.
                      Dominant subscription: {dominantSubscription ?? 'waiting for data'}.
                    </p>
                  </div>
                </div>
              </section>
            </div>
            <section className="panel">
              <h3 className="panel-title">{selectedTierTitle} Location Utilization</h3>
              {selectedLocationRows.length ? (
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
                      {selectedLocationRows.map((row) => (
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
                <p className="muted">No tier-specific location utilization data available.</p>
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
              <section className="panel">
                <h3 className="panel-title">Lifestyle Intervention Strategy</h3>
                <div className="insight-list">
                  <div className="insight-item">
                    <p className="insight-label">High-readiness clusters</p>
                    <p className="muted" style={{ margin: 0 }}>Use progressive training, retention nudges, and premium program offers.</p>
                  </div>
                  <div className="insight-item">
                    <p className="insight-label">Recovery-risk clusters</p>
                    <p className="muted" style={{ margin: 0 }}>Prioritize lighter plans, sleep coaching, stress management, and wellness check-ins.</p>
                  </div>
                </div>
              </section>
            </div>
            <div className="grid two-column">
              <LifestyleScatterPanel points={lifestyle?.scatter_points} loading={dashboard.loading} />
              <section className="panel">
                <h3 className="panel-title">User Cluster Personas</h3>
                {lifestyle?.profile_cards.length ? (
                  <div className="persona-grid">
                    {lifestyle.profile_cards.map((card) => (
                      <article key={card.cluster_id} className="cluster-card persona-card">
                        <div className="persona-header">
                          <div>
                            <p className="cluster-card-title">Cluster {card.cluster_id}: {card.label}</p>
                            <p className="muted" style={{ margin: '4px 0 0', fontSize: 12 }}>{clusterDecisionLabel(card)}</p>
                          </div>
                          <span className={`status-chip ${card.readiness_score >= 65 ? 'ready' : 'pending'}`}>
                            {card.readiness_score}/100
                          </span>
                        </div>
                        <div className="persona-metrics">
                          <span>Sleep <strong>{card.sleep_duration}h</strong></span>
                          <span>Activity <strong>{card.physical_activity_level}</strong></span>
                          <span>Stress <strong>{card.stress_level}</strong></span>
                          <span>Records <strong>{formatNumber(card.record_count)}</strong></span>
                        </div>
                        <p className="persona-action">{clusterDecisionAction(card)}</p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="muted">No cluster profile data available.</p>
                )}
              </section>
            </div>
            <div className="grid three-column">
              <ChartPanel title="Cluster Quality: Silhouette Scores" data={lifestyle?.silhouette_scores} loading={dashboard.loading} />
              <ChartPanel title="Average Sleep Duration by Lifestyle Cluster" data={lifestyle?.sleep_duration_by_cluster} loading={dashboard.loading} />
              <ChartPanel title="Physical Activity Level by Lifestyle Cluster" data={lifestyle?.activity_by_cluster} loading={dashboard.loading} />
              <ChartPanel title="Stress Level by Lifestyle Cluster" data={lifestyle?.stress_by_cluster} loading={dashboard.loading} />
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
            <DecisionMappingPanel
              readiness={workout.data?.preprocess.readiness ?? null}
              intensity={workout.data?.intensity ?? null}
              mapping={workout.data?.plan.decision_mapping ?? null}
            />
            <div className="grid kpi-grid">
              <KPICard title="Calories" value={workout.data ? workout.data.calories.prediction : '-'} detail={formatCalorieUnit(workout.data?.calories.unit)} icon="model" />
              <KPICard title="Intensity" value={workout.data?.intensity.predicted_class ?? '-'} detail={workout.data?.intensity.model_name ?? 'No model call yet'} icon="readiness" />
              <KPICard title="Training Score" value={workout.data?.plan.decision_mapping.combined_training_score ?? '-'} detail={workout.data?.plan.decision_mapping.recommendation_level ?? 'No mapping yet'} icon="exercise" />
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
                      <p className="insight-label">Recommendation mapping</p>
                      <p className="muted" style={{ margin: 0 }}>
                        {workout.data.plan.decision_mapping.primary_action}
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
