import { SankeyGraph } from '../types/dashboard.types'

interface SankeyJourneyPanelProps {
  graph?: SankeyGraph
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

export default function SankeyJourneyPanel({ graph }: SankeyJourneyPanelProps) {
  const nodes = graph?.nodes ?? []
  const links = graph?.links ?? []
  const maxLink = Math.max(...links.map((link) => link.value), 1)
  const grouped = groupOrder.map((group) => ({
    group,
    nodes: nodes.filter((node) => node.group === group).slice(0, 8),
  }))

  return (
    <section className="panel">
      <h3 className="panel-title">Sankey Diagram: Subscription-to-Workout Demand Journey</h3>
      <p className="chart-subtitle">Shows how filtered sessions flow from subscription segment to location, workout type, and burn-intensity segment.</p>
      {nodes.length === 0 || links.length === 0 ? (
        <p className="muted">No Sankey journey data available for the selected filters.</p>
      ) : (
        <div className="sankey-layout">
          <div className="sankey-columns">
            {grouped.map(({ group, nodes: groupNodes }) => (
              <div key={group} className="sankey-column">
                <span className="sankey-group-label">{groupLabels[group]}</span>
                {groupNodes.map((node) => (
                  <div key={node.id} className="sankey-node" style={{ borderLeftColor: colors[group] }}>
                    {node.label}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="sankey-links">
            {links.slice(0, 16).map((link) => (
              <div key={`${link.source}-${link.target}`} className="sankey-link-row">
                <span>{link.source.split(':', 2)[1]}</span>
                <div className="sankey-link-track">
                  <span style={{ width: `${Math.max(8, (link.value / maxLink) * 100)}%` }} />
                </div>
                <span>{link.target.split(':', 2)[1]}</span>
                <strong>{link.value}</strong>
              </div>
            ))}
          </div>
        </div>
      )}
      <p className="chart-legend">Legend: thicker bars represent higher session volume between two journey stages.</p>
    </section>
  )
}
