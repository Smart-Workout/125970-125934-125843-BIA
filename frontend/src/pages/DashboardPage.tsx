import { useState } from 'react'
import { Activity, AlertCircle, BarChart2, Brain, Building2, Dumbbell, FileText, Home, Info, LayoutDashboard, MessageSquare, RefreshCw, Target, UserRound, Users, X, Zap } from 'lucide-react'
import ErrorBoundary from '../components/ErrorBoundary'
import { Link, useNavigate } from 'react-router-dom'
import Range from 'rc-slider'
import 'rc-slider/assets/index.css'
import CalendarHeatmap from '../components/CalendarHeatmap'
import ChartPanel from '../components/ChartPanel'
import ChatPanel from '../components/ChatPanel'
import DecisionMappingPanel from '../components/DecisionMappingPanel'
import DistributionPanel from '../components/DistributionPanel'
import EngagementScatter from '../components/EngagementScatter'
import ExerciseTable from '../components/ExerciseTable'
import FloatingChatAssistant from '../components/FloatingChatAssistant'
import KPICard from '../components/KPICard'
import LifestyleScatterPanel from '../components/LifestyleScatterPanel'
import Neo4JSourceGraph from '../components/Neo4JSourceGraph'
import PlanCard from '../components/PlanCard'
import ProbabilityBars from '../components/ProbabilityBars'
import ProfileForm from '../components/ProfileForm'
import RadarProfilePanel from '../components/RadarProfilePanel'
import SankeyJourneyPanel from '../components/SankeyJourneyPanel'
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
    title: 'Executive Overview: Priority Action Centre',
    description: 'One-page snapshot of your member base, top-performing locations, dominant wellness segment, and plan quality. Use this to identify where to focus business attention first.',
  },
  membership: {
    title: 'Membership Utilisation and Revenue Signals',
    description: 'Subscription cohort and location analytics. Compare plans by member count, revenue, and workout demand to target promotions and service adjustments.',
  },
  lifestyle: {
    title: 'Member Lifestyle Segments',
    description: 'Members are grouped into 4 wellness profiles based on sleep, activity, stress, and readiness scores. Use these segments to decide who needs recovery support, habit coaching, or progressive training.',
  },
  profile: {
    title: 'Client Profile and Readiness Inputs',
    description: 'Fill in your goals, wellness readings, and constraints. The system estimates your readiness to train before generating a personalised plan.',
  },
  plan: {
    title: 'Personalised Plan: Prediction and Weekly Schedule',
    description: 'Readiness is estimated first. An ML model then predicts workout intensity and calorie targets. A weekly exercise programme is assembled from those predictions.',
  },
  chat: {
    title: 'Plan Rationale Assistant',
    description: 'Ask questions about your generated plan. The assistant uses your profile and supporting evidence to explain exercise choices and answer follow-up questions.',
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
const formatSignedNumber = (value: number, digits = 1) => {
  const rounded = Number(value.toFixed(digits))
  if (rounded === 0) return '0'
  return `${rounded > 0 ? '+' : ''}${rounded}`
}
const formatSignedPercent = (value: number, digits = 1) => {
  const rounded = Number(value.toFixed(digits))
  if (rounded === 0) return '0%'
  return `${rounded > 0 ? '+' : ''}${rounded}%`
}
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

const getSegmentAxisLabel = (card: LifestyleProfileCard): string => {
  const lbl = (card.label || '').toLowerCase()
  const short = lbl.includes('strain') || lbl.includes('low recovery') ? 'Strained'
    : lbl.includes('moderate') || lbl.includes('mixed') ? 'Balanced'
    : clusterDecisionLabel(card).split('-')[0].trim()
  return `Seg.${card.cluster_id} \u00b7 ${short}`
}

const foodPlanningRole = (category: string) => {
  const normalized = category.toLowerCase()
  if (normalized.includes('protein') || normalized.includes('meat') || normalized.includes('egg')) return 'Plan as recovery or muscle-support food.'
  if (normalized.includes('grain') || normalized.includes('carb')) return 'Plan as training-energy food.'
  if (normalized.includes('fruit') || normalized.includes('vegetable')) return 'Plan as micronutrient and habit-support food.'
  if (normalized.includes('drink') || normalized.includes('water')) return 'Plan as hydration support.'
  return 'Use as a meal-category option for nutrition planning.'
}

const mostCommonLabel = (chart?: ChartData) => {
  if (!chart?.values.length) return 'Waiting for data'
  const index = chart.values.indexOf(Math.max(...chart.values))
  return chart.labels[index] ?? 'Waiting for data'
}

const weekdayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const executivePriorityDefinitions: Record<string, string> = {
  'Utilization priority': 'Most-used gym location in the selected filter. Higher sessions usually indicate staffing and capacity pressure.',
  'Membership focus': 'Subscription plan segment with highest influence in the selected view. Helps target retention and promotion actions.',
  'Readiness segment focus': 'Dominant wellness segment based on sleep, stress, activity, and readiness signals. Guides intervention strategy.',
  'Plan generation signal': 'Health check for whether prediction outputs can be converted into a practical weekly plan.',
}

const descriptiveGlossary = [
  { term: 'Utilization', definition: 'How heavily facilities are used, usually measured by check-ins or session volume.' },
  { term: 'Retention risk', definition: 'Early warning that members may become inactive or stop renewing, based on trend softening.' },
  { term: 'Readiness score', definition: 'Wellness-based indicator of how prepared a member is for higher training intensity.' },
  { term: 'Segment', definition: 'A member group with similar behavior or wellness patterns, used for targeted actions.' },
  { term: 'Lift', definition: 'Relative change versus a baseline. Example: weekend check-ins compared with weekday average.' },
  { term: 'Outlier', definition: 'Unusually high or low value compared with the typical range, often requiring investigation.' },
]

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
  const [dismissedError, setDismissedError] = useState<string | null>(null)
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
    setDismissedError(null)
    health.refresh()
    dashboard.refresh()
  }

  const activeError = (health.error || dashboard.error || workout.error) ?? null
  const showError = activeError && activeError !== dismissedError
  const activeFilterCount = [
    selectedLocations.length > 0,
    selectedGender !== '',
    monthSelectionMode === 'range' ? (startMonth !== '' || endMonth !== '') : selectedMonths.length > 0,
  ].filter(Boolean).length
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
  const totalPlanMrr = selectedTierPlans.reduce((s, r) => s + r.estimated_monthly_recurring_revenue, 0)
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
  const dominantReadinessSegment = dominantCluster ? clusterDecisionLabel(dominantCluster) : null
  const readinessSegmentDetail = dominantCluster
    ? `${dominantCluster.label}: readiness ${dominantCluster.readiness_score}/100, stress ${dominantCluster.stress_level}`
    : 'Use readiness segments to decide whether to push progression, retention support, or recovery-first guidance.'
  const totalScheduledExercises = plan?.weekly_schedule.reduce((sum, day) => sum + day.exercises.length, 0) ?? 0
  const firstFocus = plan?.weekly_schedule[0]?.focus ?? null
  const nutritionMealTypes = nutrition?.meal_calories.labels.length ?? 0
  const nutritionCategoryNames = [...new Set(nutrition?.top_protein_foods.map((item) => item.category).filter(Boolean) ?? [])]
  const nutritionTopMealType = mostCommonLabel(nutrition?.meal_calories)
  const nutritionTopMacro = mostCommonLabel(nutrition?.macro_mix)
  const nutritionCategoryMix: ChartData = {
    labels: nutritionCategoryNames,
    values: nutritionCategoryNames.map((category) => nutrition?.top_protein_foods.filter((item) => item.category === category).length ?? 0),
  }
  const exerciseEquipmentTypes = exerciseDashboard?.equipment_coverage.labels.length ?? 0
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
  const hasCalendarData = (executive?.calendar_heatmap.length ?? 0) > 0
  const weekdaySessionSummary = weekdayOrder.reduce((acc, weekday) => {
    acc.set(weekday, { total: 0, days: 0 })
    return acc
  }, new Map<string, { total: number; days: number }>())
  ;(executive?.calendar_heatmap ?? []).forEach((day) => {
    const current = weekdaySessionSummary.get(day.weekday)
    if (!current) return
    current.total += day.session_count
    current.days += 1
  })
  const weekdayDemandTrend: ChartData | undefined = hasCalendarData
    ? {
        labels: weekdayOrder.map((day) => day.slice(0, 3)),
        values: weekdayOrder.map((day) => {
          const stats = weekdaySessionSummary.get(day)
          if (!stats || stats.days === 0) return 0
          return Number((stats.total / stats.days).toFixed(1))
        }),
      }
    : undefined
  const executiveMonths = executive?.monthly_activity.labels ?? []
  const executiveMonthlyValues = executive?.monthly_activity.values ?? []
  const latestMonthIndex = executiveMonthlyValues.length - 1
  const latestMonthValue = latestMonthIndex >= 0 ? executiveMonthlyValues[latestMonthIndex] : 0
  const previousMonthValue = latestMonthIndex > 0 ? executiveMonthlyValues[latestMonthIndex - 1] : 0
  const sessionMomentumPercent = previousMonthValue > 0
    ? ((latestMonthValue - previousMonthValue) / previousMonthValue) * 100
    : 0
  const locationValues = executive?.location_mix.values ?? []
  const locationTotal = locationValues.reduce((sum, value) => sum + value, 0)
  const topLocationContribution = locationTotal > 0 && locationValues.length > 0
    ? (Math.max(...locationValues) / locationTotal) * 100
    : 0
  const weekdayValues = weekdayDemandTrend?.values ?? []
  const weekdayPeakPressure = weekdayValues.length
    ? Math.max(...weekdayValues) - Math.min(...weekdayValues)
    : 0
  const avgDurationDelta = executive
    ? executive.kpis.avg_duration_minutes - executive.duration_distribution.median
    : 0
  const filterBreadcrumbs = [
    {
      label: 'View',
      value: workspaceViewOptions.find((item) => item.id === workspaceView)?.label ?? 'Executive summary',
    },
    {
      label: 'Period',
      value: monthSelectionMode === 'specific'
        ? selectedMonthLabel
        : `${displayStartMonth} to ${displayEndMonth}`,
    },
    {
      label: 'Gender',
      value: selectedGender || 'All',
    },
    {
      label: 'Locations',
      value: selectedLocations.length ? `${selectedLocations.length} selected` : 'All',
    },
  ]
  const kpiTrendChips = [
    {
      label: 'Session momentum',
      value: formatSignedPercent(sessionMomentumPercent),
      detail: executiveMonths.length > 1
        ? `${executiveMonths[latestMonthIndex - 1]} to ${executiveMonths[latestMonthIndex]}`
        : 'Need at least 2 months',
      tone: sessionMomentumPercent > 0 ? 'up' : sessionMomentumPercent < 0 ? 'down' : 'neutral',
    },
    {
      label: 'Duration vs median',
      value: `${formatSignedNumber(avgDurationDelta)} min`,
      detail: 'Current average against median session length',
      tone: avgDurationDelta > 0 ? 'up' : avgDurationDelta < 0 ? 'down' : 'neutral',
    },
    {
      label: 'Top location concentration',
      value: `${topLocationContribution.toFixed(1)}%`,
      detail: 'Share held by the highest-load location',
      tone: topLocationContribution >= 35 ? 'up' : topLocationContribution <= 25 ? 'down' : 'neutral',
    },
    {
      label: 'Weekday demand spread',
      value: `${weekdayPeakPressure.toFixed(1)}`,
      detail: 'Gap between lowest and highest weekday avg check-ins',
      tone: weekdayPeakPressure >= 10 ? 'up' : weekdayPeakPressure <= 4 ? 'down' : 'neutral',
    },
  ]

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

  const setRangeMonth = (field: 'start' | 'end', month: string) => {
    if (!month) {
      if (field === 'start') setStartMonth('')
      else setEndMonth('')
      return
    }
    if (!months.includes(month)) return
    if (field === 'start') setStartMonth(month)
    else setEndMonth(month)
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
      label: 'Readiness segment focus',
      value: dominantReadinessSegment ?? 'Waiting for readiness data',
      detail: readinessSegmentDetail,
    },
    {
      label: 'Plan generation signal',
      value: workout.data ? `${workout.data.plan.decision_mapping.recommendation_level}` : 'Awaiting sample profile',
      detail: workout.data
        ? `${workout.data.preprocess.readiness.band} readiness, ${workout.data.intensity.predicted_class} intensity, score ${workout.data.plan.decision_mapping.combined_training_score}/100`
        : 'Used by executives as a quality check that prediction outputs can become an actionable weekly plan.',
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
            <button className="icon-button" type="button" onClick={refreshAll} aria-label="Refresh data">
              <RefreshCw size={15} className={dashboard.loading || health.loading ? 'spin' : ''} />
              {dashboard.loading ? 'Loading…' : 'Refresh'}
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
          <ErrorBoundary title="Dashboard content">
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

        {showError && (
          <div className="error-banner" style={{ marginBottom: 14 }}>
            <AlertCircle size={15} className="error-banner-icon" />
            <span style={{ flex: 1 }}>{activeError}</span>
            <button className="error-banner-dismiss" type="button" onClick={() => setDismissedError(activeError)} aria-label="Dismiss error">
              <X size={14} />
            </button>
          </div>
        )}
        {audienceMode === 'executive' && activeFilterCount > 0 && (
          <div className="active-filters-bar" style={{ marginBottom: 14 }}>
            <span className="active-filters-label">Active filters</span>
            {selectedGender && (
              <span className="active-filter-chip">
                Gender: {selectedGender}
                <button type="button" onClick={() => setSelectedGender('')} aria-label="Remove gender filter">×</button>
              </span>
            )}
            {selectedLocations.length > 0 && (
              <span className="active-filter-chip">
                {selectedLocations.length} location{selectedLocations.length > 1 ? 's' : ''}
                <button type="button" onClick={() => setSelectedLocations([])} aria-label="Remove location filter">×</button>
              </span>
            )}
            {monthSelectionMode === 'range' && (startMonth || endMonth) && (
              <span className="active-filter-chip">
                {displayStartMonth} → {displayEndMonth}
                <button type="button" onClick={() => { setStartMonth(''); setEndMonth('') }} aria-label="Remove date filter">×</button>
              </span>
            )}
            {monthSelectionMode === 'specific' && selectedMonths.length > 0 && (
              <span className="active-filter-chip">
                {selectedMonths.length} month{selectedMonths.length > 1 ? 's' : ''}
                <button type="button" onClick={() => setSelectedMonths([])} aria-label="Remove month filter">×</button>
              </span>
            )}
          </div>
        )}

        {audienceMode === 'executive' && (
          <div className="filter-breadcrumb-bar" style={{ marginBottom: 14 }}>
            {filterBreadcrumbs.map((crumb) => (
              <span key={crumb.label} className="filter-breadcrumb-chip">
                <strong>{crumb.label}:</strong>
                <span>{crumb.value}</span>
              </span>
            ))}
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
                      <Range
                        min={0}
                        max={monthMax}
                        value={[displayStartMonthIndex, displayEndMonthIndex]}
                        onChange={(value) => {
                          if (!Array.isArray(value)) return
                          setStartMonth(months[value[0]] ?? '');
                          setEndMonth(months[value[1]] ?? '');
                        }}
                        disabled={months.length === 0}
                        allowCross={false}
                        style={{ marginTop: 8 }}
                        trackStyle={[{ backgroundColor: '#4f46e5' }]}
                        handleStyle={[
                          { borderColor: '#4f46e5', backgroundColor: '#4f46e5' },
                          { borderColor: '#4f46e5', backgroundColor: '#4f46e5' }
                        ]}
                        railStyle={{ backgroundColor: '#e5e7eb' }}
                      />
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
              <div className="field gender-slicer">
                <label htmlFor="gender-filter">Gender</label>
                <select id="gender-filter" value={selectedGender} onChange={(event) => setSelectedGender(event.target.value)}>
                  <option value="">All</option>
                  {filters?.genders.map((genderName) => <option key={genderName} value={genderName}>{genderName}</option>)}
                </select>
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
            </section>

            <section className="priority-grid">
              {executivePriorities.map((item) => (
                <article key={item.label} className="priority-card">
                  <span className="label-with-info">
                    {item.label}
                    {executivePriorityDefinitions[item.label] && (
                      <span
                        className="inline-info-trigger"
                        tabIndex={0}
                        role="note"
                        aria-label={executivePriorityDefinitions[item.label]}
                        data-tooltip={executivePriorityDefinitions[item.label]}
                      >
                        <Info size={11} />
                      </span>
                    )}
                  </span>
                  {dashboard.loading ? (
                    <div className="kpi-skeleton" style={{ marginTop: 6 }}>
                      <div className="skeleton skeleton-value" />
                      <div className="skeleton skeleton-detail" />
                    </div>
                  ) : (
                    <>
                      <strong>{item.value}</strong>
                      <p>{item.detail}</p>
                    </>
                  )}
                </article>
              ))}
            </section>

            {workspaceView === 'executive' && (
              <div className="grid">
                <section className="panel kpi-trend-panel">
                  <h3 className="panel-title" style={{ marginBottom: 6 }}>KPI Trend Snapshot</h3>
                  <p className="panel-subtitle" style={{ marginBottom: 10 }}>Small directional signals to spot acceleration, concentration, and demand pressure quickly.</p>
                  <div className="kpi-trend-grid">
                    {kpiTrendChips.map((chip) => (
                      <article key={chip.label} className="kpi-trend-chip">
                        <p className="kpi-trend-label">{chip.label}</p>
                        <p className={`kpi-trend-value ${chip.tone}`}>{chip.value}</p>
                        <p className="kpi-trend-detail">{chip.detail}</p>
                      </article>
                    ))}
                  </div>
                </section>
                <section className="panel descriptive-glossary-panel">
                  <h3 className="panel-title" style={{ marginBottom: 6 }}>Descriptive Terms Guide</h3>
                  <p className="panel-subtitle" style={{ marginBottom: 10 }}>Hover each info icon for plain-language definitions used in this dashboard.</p>
                  <div className="glossary-chip-row">
                    {descriptiveGlossary.map((item) => (
                      <span key={item.term} className="glossary-chip">
                        {item.term}
                        <span
                          className="inline-info-trigger"
                          tabIndex={0}
                          role="note"
                          aria-label={item.definition}
                          data-tooltip={item.definition}
                        >
                          <Info size={11} />
                        </span>
                      </span>
                    ))}
                  </div>
                </section>
                <div className="grid kpi-grid">
                  <KPICard title="Sessions" value={executive?.kpis.selected_sessions ?? 0} detail="Filtered check-ins" icon="exercise" loading={dashboard.loading} />
                  <KPICard title="Users" value={executive?.kpis.selected_users ?? 0} detail="Unique users in filter" icon="dataset" loading={dashboard.loading} />
                  <KPICard title="Avg Duration" value={`${executive?.kpis.avg_duration_minutes ?? 0} min`} detail="Per session" icon="server" loading={dashboard.loading} />
                  <KPICard title="Top Location" value={topLocation?.location ?? 'Waiting'} detail="Highest selected utilization" icon="model" loading={dashboard.loading} />
                </div>
                <div className="grid two-column">
                  <section className="panel gif-feature-panel" aria-label="Decorative animation panel">
                    <img
                      src="/tumblr_mptt49hvA11s6wlblo1_500.gif"
                      alt="Decorative animation"
                      loading="lazy"
                    />
                  </section>
                  <ChartPanel title="Training Demand Mix by Workout Type" subtitle="Identifies which training formats are driving program demand." data={executive?.workout_mix} loading={dashboard.loading} />
                  <ChartPanel title="Member Gender Composition in Selected Filter" subtitle="Context for comparing behavior across gender segments." data={executive?.gender_mix} type="pie" loading={dashboard.loading} />
                  <ChartPanel title="Location Contribution to Selected Utilization" subtitle="Highlights which branches carry the selected demand." data={executive?.location_mix} loading={dashboard.loading} />
                </div>
                <div className="grid two-column" style={{ alignItems: 'start' }}>
                  <div className="grid" style={{ gap: 12 }}>
                    <UsageHeatmap cells={executive?.usage_heatmap} loading={dashboard.loading} />
                    <CalendarHeatmap days={executive?.calendar_heatmap} loading={dashboard.loading} />
                  </div>
                  <div className="grid" style={{ gap: 12 }}>
                    <EngagementScatter points={executive?.engagement_scatter} loading={dashboard.loading} />
                    <ChartPanel
                      title="Average Check-ins by Day of Week"
                      subtitle="Shows your typical demand pattern by weekday. Use this to plan staffing, class slots, and promotions on low-traffic days."
                      data={weekdayDemandTrend}
                      type="line"
                      legend="X-axis: weekday. Y-axis: average number of check-ins for that weekday in the selected date range."
                      loading={dashboard.loading}
                    />
                  </div>
                </div>
                <SankeyJourneyPanel graph={executive?.journey_sankey} loading={dashboard.loading} />
                <div className="grid two-column">
                  <DistributionPanel
                    title="Calorie Burn Spread: Typical Range and Outliers"
                    subtitle="Shows how calories burned per session vary across members. The box marks the typical range; dots beyond the lines are unusually high or low sessions."
                    summary={executive?.calorie_distribution}
                  />
                  <DistributionPanel
                    title="Session Length Spread: Typical Range and Outliers"
                    subtitle="Shows how visit lengths vary. Use the typical range to inform class scheduling and staffing decisions. Dots beyond the lines are unusually short or long sessions."
                    summary={executive?.duration_distribution}
                  />
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
                    <div className="table-wrap virtual-scroll">
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
                  <KPICard title="Food Catalog" value={nutrition?.kpis.food_items ?? 0} detail="Available food records" icon="dataset" loading={dashboard.loading} />
                  <KPICard title="Meal Types" value={nutritionMealTypes} detail="Breakfast, lunch, dinner, snacks, or similar groups" icon="model" loading={dashboard.loading} />
                  <KPICard title="Food Categories" value={nutritionCategoryNames.length} detail="Planning categories available" icon="exercise" loading={dashboard.loading} />
                  <KPICard title="Primary Macro Focus" value={nutritionTopMacro} detail="Largest macro group in the selected data" icon="readiness" loading={dashboard.loading} />
                </div>
                <div className="grid two-column">
                  <ChartPanel title="Nutrition Macro Mix for Plan Support" data={nutrition?.macro_mix} type="pie" loading={dashboard.loading} />
                  <ChartPanel title="Meal Type Coverage" subtitle={`Most represented meal type: ${nutritionTopMealType}.`} data={nutrition?.meal_calories} loading={dashboard.loading} legend="X-axis shows meal type. Y-axis shows available food records for planning coverage." />
                  <ChartPanel title="Food Category Coverage" subtitle="Shows which food groups can support plan recommendations." data={nutritionCategoryMix} loading={dashboard.loading} legend="X-axis shows food category. Y-axis shows available candidate foods." />
                  <section className="panel">
                    <h3 className="panel-title">Food Planning Table</h3>
                    {nutrition?.top_protein_foods.length ? (
                      <div className="table-wrap virtual-scroll">
                        <table>
                          <thead>
                            <tr>
                              <th>Food</th>
                              <th>Meal</th>
                              <th>Category</th>
                              <th>Planning Role</th>
                            </tr>
                          </thead>
                          <tbody>
                            {nutrition.top_protein_foods.map((row) => (
                              <tr key={`${row.food_item}-${row.meal_type}`}>
                                <td>{row.food_item}</td>
                                <td>{row.meal_type}</td>
                                <td>{row.category}</td>
                                <td>{foodPlanningRole(row.category)}</td>
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
                  <KPICard title="Equipment Types" value={exerciseEquipmentTypes} detail="ExerciseDB equipment coverage" icon="model" loading={dashboard.loading} />
                  <KPICard title="Avg Duration" value={`${exerciseDashboard?.kpis.avg_duration_minutes ?? 0} min`} detail="Per session" icon="server" loading={dashboard.loading} />
                </div>
                <div className="grid two-column">
                  <ChartPanel title="Exercise Session Mix by Workout Type" data={exerciseDashboard?.workout_mix} loading={dashboard.loading} />
                  <ChartPanel title="ExerciseDB Body Part Coverage" data={exerciseDashboard?.body_part_coverage} loading={dashboard.loading} />
                  <ChartPanel title="Average Duration by Workout Type" data={exerciseDashboard?.duration_by_workout} loading={dashboard.loading} />
                  <ChartPanel title="ExerciseDB Equipment Coverage for Plan Assembly" data={exerciseDashboard?.equipment_coverage} loading={dashboard.loading} />
                </div>
                <ShapImpactPanel rows={exerciseDashboard?.shap_summary} loading={dashboard.loading} />
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
                    {workout.data.preprocess.processed_profile.gym_type && (
                      <p className="muted" style={{ margin: 0 }}>Gym type: {workout.data.preprocess.processed_profile.gym_type} — equipment constrained to gym capabilities</p>
                    )}
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
              <KPICard title="Members" value={formatNumber(selectedTierMembers)} detail={`${selectedMemberShare.toFixed(1)}% of all members`} icon="dataset" loading={dashboard.loading} />
              <KPICard title="Gym Check-ins (Sample)" value={formatNumber(selectedTierSessions)} detail={`${selectedSessionShare.toFixed(1)}% of all recorded visits`} icon="exercise" loading={dashboard.loading} />
              <KPICard title="Estimated MRR" value={formatCurrency(selectedTierMrr)} detail="Selected subscription revenue" icon="plan" loading={dashboard.loading} />
              <KPICard title="Top Workout" value={selectedTopWorkout} detail="Most common workout in selected group" icon="server" loading={dashboard.loading} />
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
                  <>
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
                    <p className="insight-label" style={{ marginTop: 16, marginBottom: 8 }}>Revenue share by plan</p>
                    <div className="mrr-share-visual">
                      {selectedTierPlans.map(row => {
                        const pct = totalPlanMrr > 0 ? (row.estimated_monthly_recurring_revenue / totalPlanMrr * 100) : 0
                        return (
                          <div key={row.subscription_plan} className="mrr-share-row">
                            <span className="mrr-share-name">{row.subscription_plan}</span>
                            <div className="mrr-share-track">
                              <div className="mrr-share-fill" style={{ width: `${Math.round(pct)}%` }} />
                            </div>
                            <span className="mrr-share-pct">{Math.round(pct)}%</span>
                          </div>
                        )
                      })}
                    </div>
                  </>
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
                    <p className="insight-label">Engagement note</p>
                    <p className="insight-value">{selectedAvgCheckins} sampled visits/member</p>
                    <p className="muted" style={{ margin: '4px 0 0' }}>This is a sample-based engagement signal, not total lifetime attendance.</p>
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
            <section className="panel tableau-embed-panel">
              <h3 className="panel-title">Gym Location Utilization — Geographic View</h3>
              <p className="muted" style={{ margin: '-4px 0 12px', fontSize: 13 }}>
                Bubble size = session volume. Colour = gym type. Interactive map powered by Tableau Public.
              </p>
              <div className="tableau-frame-wrap">
                <iframe
                  src="https://public.tableau.com/views/SmartWorkout/GymLocationMap?:embed=y&:showVizHome=no&:toolbar=no&:animate_transition=yes"
                  width="100%"
                  height="520"
                  style={{ border: 'none', borderRadius: 6, display: 'block' }}
                  title="Gym Location Utilization Map"
                  allowFullScreen
                />
              </div>
            </section>
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
                <h3 className="panel-title">Wellness Segment Summary</h3>
                <div className="insight-list">
                  <div className="insight-item">
                    <p className="insight-label">Largest member segment</p>
                    <p className="insight-value">
                      {dominantCluster ? `${dominantReadinessSegment} — ${dominantCluster.label}` : 'Waiting for data'}
                    </p>
                  </div>
                  <div className="insight-item">
                    <p className="insight-label">What this means for your business</p>
                    <p className="muted" style={{ margin: 0 }}>
                      The dominant segment tells you whether most members are ready for harder training, or whether recovery coaching and lighter programming should be the priority.
                    </p>
                  </div>
                </div>
              </section>
              <section className="panel">
                <h3 className="panel-title">Recommended Actions by Segment Type</h3>
                <div className="insight-list">
                  <div className="insight-item">
                    <p className="insight-label">High-readiness members (e.g. Balanced segments)</p>
                    <p className="muted" style={{ margin: 0 }}>Offer progressive training plans, retention rewards, and premium programme upgrades.</p>
                  </div>
                  <div className="insight-item">
                    <p className="insight-label">Recovery-risk members (e.g. Strained segments)</p>
                    <p className="muted" style={{ margin: 0 }}>Prioritise lighter sessions, sleep coaching, stress management courses, and wellness check-ins before any progression.</p>
                  </div>
                </div>
              </section>
            </div>
            <div className="grid two-column">
              <LifestyleScatterPanel
              points={lifestyle?.scatter_points}
              loading={dashboard.loading}
              clusterNames={
                lifestyle?.profile_cards
                  ? Object.fromEntries(lifestyle.profile_cards.map(c => [c.cluster_id, getSegmentAxisLabel(c)]))
                  : undefined
              }
            />
              <RadarProfilePanel metrics={lifestyle?.radar_metrics} loading={dashboard.loading} />
            </div>
            <section className="panel">
              <h3 className="panel-title">Member Lifestyle Segment Profiles</h3>
                {lifestyle?.profile_cards.length ? (
                  <div className="persona-grid">
                    {lifestyle.profile_cards.map((card) => (
                      <article key={card.cluster_id} className="cluster-card persona-card">
                        <div className="persona-header">
                          <div>
                            <p className="cluster-card-title">Segment {card.cluster_id}: {clusterDecisionLabel(card)}</p>
                            <p className="muted" style={{ margin: '4px 0 0', fontSize: 12 }}>{card.label}</p>
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
                  <div className="empty-state">
                    <div className="empty-state-icon"><Users size={18} /></div>
                    <p className="empty-state-title">No segment data</p>
                    <p className="empty-state-detail">Cluster personas appear once lifestyle segmentation returns results.</p>
                  </div>
                )}
              </section>
            <div className="grid two-column">
              <ChartPanel
                title="How Distinct Are the 4 Member Groups? (Cluster Quality)"
                subtitle="A silhouette score measures how cleanly members fit their assigned group vs. others. Score near 1.0 = very distinct, well-separated groups. k=4 (4 groups) was chosen as the best configuration."
                data={lifestyle?.silhouette_scores}
                loading={dashboard.loading}
                legend="X-axis: number of groups tested (k). Y-axis: quality score (0–1, higher = cleaner, more distinct groups)."
              />
              <ChartPanel
                title="Average Nightly Sleep by Member Segment"
                subtitle="Compares average hours of sleep per segment. Under 6.5 hours is an early indicator of recovery risk and reduced training capacity."
                data={lifestyle?.sleep_duration_by_cluster}
                loading={dashboard.loading}
                legend="X-axis: member segment. Y-axis: average sleep hours per night."
              />
              <ChartPanel
                title="Physical Activity Level by Member Segment"
                subtitle="Average activity score per segment (0–100 scale). Higher scores indicate more physically active members who may handle higher training volume."
                data={lifestyle?.activity_by_cluster}
                loading={dashboard.loading}
                legend="X-axis: member segment. Y-axis: physical activity level (0–100 scale)."
              />
              <ChartPanel
                title="Stress Level by Member Segment"
                subtitle="Average stress per segment (1–10 scale). A score above 7 flags a recovery-first group — members who need lighter programming and wellness support before any progression."
                data={lifestyle?.stress_by_cluster}
                loading={dashboard.loading}
                legend="X-axis: member segment. Y-axis: stress level (1–10 scale, lower is better)."
              />
            </div>
            <div className="grid three-column">
              <ChartPanel
                title="Training Readiness Score by Member Segment"
                subtitle="Average readiness score per lifestyle group (0–10 scale). Higher = more ready for progressive training. Lower = recovery-first priority."
                data={lifestyle?.profile_cards.length ? {
                  labels: lifestyle.profile_cards.map(c => getSegmentAxisLabel(c)),
                  values: lifestyle.profile_cards.map(c => c.readiness_score)
                } : undefined}
                loading={dashboard.loading}
                legend="X-axis: member segment. Y-axis: average readiness score (0–10)."
              />
              <ChartPanel
                title="Member Share by Wellness Profile"
                subtitle="Proportional breakdown of the member base across the 4 lifestyle segments. The dominant slice is the most common wellness profile in your gym."
                data={lifestyle?.profile_cards.length ? {
                  labels: lifestyle.profile_cards.map(c => c.label),
                  values: lifestyle.profile_cards.map(c => c.record_count)
                } : undefined}
                type="pie"
                loading={dashboard.loading}
              />
              <ChartPanel
                title="How Many Members Are in Each Segment?"
                subtitle="Member count per lifestyle group. Larger segments have the greatest business impact — interventions here affect the most members."
                data={lifestyle?.profile_cards.length ? {
                  labels: lifestyle.profile_cards.map(c => getSegmentAxisLabel(c)),
                  values: lifestyle.profile_cards.map(c => c.record_count)
                } : undefined}
                loading={dashboard.loading}
                legend="X-axis: member segment. Y-axis: number of members."
              />
            </div>
          </div>
        )}

        {activeTab === 'plan' && (
          <div className="grid">
            <section className="panel">
              <h3 className="panel-title">How Your Plan Is Built: A Step-by-Step Overview</h3>
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
              <KPICard title="Calories" value={workout.data ? workout.data.calories.prediction : '-'} detail={workout.data ? `${formatCalorieUnit(workout.data.calories.unit)} · ${workout.data.calories.model_name}` : 'kcal per planned session'} icon="model" />
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
                  <div className="empty-state">
                    <div className="empty-state-icon"><FileText size={18} /></div>
                    <p className="empty-state-title">No plan generated</p>
                    <p className="empty-state-detail">Complete your profile and click Generate to see the split summary here.</p>
                  </div>
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
                      <p className="muted" style={{ margin: '4px 0 0', fontSize: 12 }}>
                        Classifier macro-F1 = 0.342 on 3 balanced classes (Low / Mid / High).
                        Labels are heart-rate-zone derived — readiness band acts as a correction layer when confidence is low.
                      </p>
                    </div>
                    <div className="insight-item">
                      <p className="insight-label">Recommendation mapping</p>
                      <p className="muted" style={{ margin: 0 }}>
                        {workout.data.plan.decision_mapping.primary_action}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon"><Brain size={18} /></div>
                    <p className="empty-state-title">Awaiting prediction</p>
                    <p className="empty-state-detail">Submit your profile to see readiness band, intensity label, and model recommendations.</p>
                  </div>
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
            </div>
            <div className="grid two-column">
              <section className="panel">
                <h3 className="panel-title">Prediction Explanation</h3>
                {workout.data ? (
                  <ul className="explanation-list">
                    {workout.data.intensity.explanation.map((item) => (
                      <li key={item} className="explanation-item">{item}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon"><BarChart2 size={18} /></div>
                    <p className="empty-state-title">No explanation yet</p>
                    <p className="empty-state-detail">Feature-level insights from the intensity model will appear here after generating a plan.</p>
                  </div>
                )}
              </section>
              <section className="panel">
                <h3 className="panel-title">Wellness Signals</h3>
                {workout.data ? (
                  <div className="signal-grid">
                    {workout.data.preprocess.readiness.score_breakdown.map((f) => (
                      <div key={f.signal} className="signal-item">
                        <div className="signal-header">
                          <span className="signal-label">{f.label}</span>
                          <span className={`signal-impact ${f.impact >= 0 ? 'pos' : 'neg'}`}>
                            {f.impact >= 0 ? '+' : ''}{f.impact}
                          </span>
                        </div>
                        <p className="signal-detail">{f.detail}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon"><Zap size={18} /></div>
                    <p className="empty-state-title">No signals yet</p>
                    <p className="empty-state-detail">Submit your profile to see how each wellness signal influences your readiness score.</p>
                  </div>
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
          </ErrorBoundary>
        </section>
      </main>
      <FloatingChatAssistant plan={workout.data?.plan ?? null} />
    </div>
  )
}
