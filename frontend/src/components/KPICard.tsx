import { Activity, BarChart3, Brain, Dumbbell, HeartPulse, Server } from 'lucide-react'

type IconName = 'server' | 'exercise' | 'dataset' | 'model' | 'readiness' | 'plan'

interface KPICardProps {
  title: string
  value: string | number
  detail?: string
  icon: IconName
  loading?: boolean
}

const icons = {
  server: Server,
  exercise: Dumbbell,
  dataset: BarChart3,
  model: Brain,
  readiness: HeartPulse,
  plan: Activity,
}

export default function KPICard({ title, value, detail, icon, loading }: KPICardProps) {
  const Icon = icons[icon]

  return (
    <section className="kpi-card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <p className="muted" style={{ margin: 0, fontSize: 12, fontWeight: 700 }}>
            {title}
          </p>
          <p style={{ margin: '8px 0 0', fontSize: 28, fontWeight: 800 }}>
            {loading ? '...' : value}
          </p>
          {detail && (
            <p className="muted" style={{ margin: '6px 0 0', fontSize: 12 }}>
              {detail}
            </p>
          )}
        </div>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 8,
            display: 'grid',
            placeItems: 'center',
            color: '#176b87',
            background: '#e8f4f7',
          }}
        >
          <Icon size={20} />
        </div>
      </div>
    </section>
  )
}

