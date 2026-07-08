import { SankeyGraph } from '../types/dashboard.types'

interface SankeyJourneyPanelProps {
  graph?: SankeyGraph
  loading?: boolean
}

const groupOrder = ['plan', 'location', 'workout', 'intensity']
const groupLabels: Record<string, string> = {
  plan: 'Subscription',
  location: 'Location',
  workout: 'Workout',
  intensity: 'Burn segment',
}

const colors: Record<string, string> = {
  plan: '#0f766e',
  location: '#168aad',
  workout: '#457b9d',
  intensity: '#e9a23b',
}

export default function SankeyJourneyPanel({ graph, loading }: SankeyJourneyPanelProps) {
  const nodes = graph?.nodes ?? []
  const links = graph?.links ?? []
  const maxLink = Math.max(...links.map((link) => link.value), 1)
  const labelFromNode = (value: string) => value.split(':', 2)[1] ?? value
  const grouped = groupOrder.map((group) => ({
    group,
    nodes: nodes.filter((node) => node.group === group).slice(0, 8),
  }))

  return (
    <section className="panel">
      <h3 className="panel-title">Member Journey: Subscription Plan → Location → Workout → Calorie Burn</h3>
      <p className="chart-subtitle">Traces where sessions go — from subscription plan, through gym location, into workout type, and calorie burn level. Wider bars = more sessions following that path.</p>
      {loading ? (
        <div className="grid" style={{ gap: 8 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: 32, borderRadius: 8 }} />
          ))}
        </div>
      ) : nodes.length === 0 || links.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><span style={{ fontSize: 22 }}>→</span></div>
          <p className="empty-state-title">No journey data</p>
          <p className="empty-state-detail">Sankey flow diagram will populate once the backend returns session journey data for the selected filters.</p>
        </div>
      ) : (
        <div className="sankey-layout">
          <div className="sankey-columns">
            {grouped.map(({ group, nodes: groupNodes }) => (
              <div key={group} className="sankey-column">
                <span className="sankey-group-label">{groupLabels[group]}</span>
                {groupNodes.map((node) => (
                  <div
                    key={node.id}
                    className="sankey-node"
                    style={{ borderLeftColor: colors[group] }}
                    title={`${groupLabels[group]}: ${node.label}`}
                  >
                    {node.label}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="sankey-links">
            {links.slice(0, 16).map((link) => (
              <div
                key={`${link.source}-${link.target}`}
                className="sankey-link-row"
                title={`${labelFromNode(link.source)} -> ${labelFromNode(link.target)}: ${link.value} sessions`}
              >
                <span className="sankey-link-label" title={labelFromNode(link.source)}>{labelFromNode(link.source)}</span>
                <div className="sankey-link-track" title={`${link.value} sessions`}>
                  <span style={{ width: `${Math.max(8, (link.value / maxLink) * 100)}%` }} />
                </div>
                <span className="sankey-link-label" title={labelFromNode(link.target)}>{labelFromNode(link.target)}</span>
                <strong title={`${link.value} sessions`}>{link.value}</strong>
              </div>
            ))}
          </div>
        </div>
      )}
      <p className="chart-legend">Legend: thicker bars represent higher session volume between two journey stages.</p>
    </section>
  )
}
