import { Activity, ArrowRight, BarChart3, Dumbbell, HeartPulse, MessageSquare, ShieldCheck, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useHealth } from '../hooks/useHealth'

const roleCards = [
  {
    to: '/user',
    eyebrow: 'For gym members',
    title: 'User Dashboard',
    description: 'Generate a weekly plan from readiness, goal, equipment, and predicted workout intensity.',
    icon: Dumbbell,
    cta: 'Open user view',
    metrics: ['Readiness check', 'Intensity prediction', 'Weekly plan'],
  },
  {
    to: '/executive',
    eyebrow: 'For managers',
    title: 'Executive Dashboard',
    description: 'Monitor membership usage, lifestyle segments, business signals, and plan-readiness quality.',
    icon: BarChart3,
    cta: 'Open executive view',
    metrics: ['Membership analytics', 'Lifestyle segments', 'Plan governance'],
  },
]

const systemHighlights = [
  { label: 'Profile inputs', value: '8+', icon: Users },
  { label: 'Plan signals', value: '3 layers', icon: HeartPulse },
  { label: 'Assistant support', value: 'RAG', icon: MessageSquare },
]

export default function HomePage() {
  const health = useHealth()
  const backendOnline = health.health?.status === 'ok'

  return (
    <main className="home-shell">
      <section className="home-hero">
        <nav className="home-nav" aria-label="Home navigation">
          <Link className="home-brand" to="/">
            <span className="brand-mark">
              <Activity size={20} />
            </span>
            <span>
              <strong>Smart Workout</strong>
              <small>Decision dashboard</small>
            </span>
          </Link>
          <span className="status-pill">
            <span className={`status-dot ${backendOnline ? 'online' : ''}`} />
            {backendOnline ? 'Backend online' : 'Backend offline'}
          </span>
        </nav>

        <div className="home-hero-grid">
          <div className="home-hero-copy">
            <p className="hero-badge">Personalized training intelligence</p>
            <h1 className="home-title">Choose the workspace you need today.</h1>
            <p className="home-description">
              Personalized workout planning powered by readiness, prediction, and actionable fitness insights.
            </p>
            <div className="home-proof-row">
              <span><ShieldCheck size={14} /> Readiness-aware recommendations</span>
              <span><Activity size={14} /> Prediction-backed weekly plans</span>
            </div>
          </div>

          <div className="home-preview-panel" aria-label="System summary">
            <div className="preview-header">
              <span>Today</span>
              <strong>Workout planning cockpit</strong>
            </div>
            <div className="preview-score-card">
              <span>Readiness workflow</span>
              <strong>Profile to Predict to Plan</strong>
              <p>Collect user condition, estimate training readiness, then turn model output into an actionable weekly program.</p>
            </div>
            <div className="preview-stat-grid">
              {systemHighlights.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="preview-stat">
                    <Icon size={16} />
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="role-section" aria-label="Dashboard roles">
        {roleCards.map((card) => {
          const Icon = card.icon
          return (
            <Link key={card.to} className="role-card" to={card.to}>
              <div className="role-card-icon">
                <Icon size={24} />
              </div>
              <span className="role-eyebrow">{card.eyebrow}</span>
              <h2>{card.title}</h2>
              <p>{card.description}</p>
              <div className="role-metric-row">
                {card.metrics.map((metric) => <span key={metric}>{metric}</span>)}
              </div>
              <strong className="role-card-cta">
                {card.cta}
                <ArrowRight size={16} />
              </strong>
            </Link>
          )
        })}
      </section>
    </main>
  )
}
