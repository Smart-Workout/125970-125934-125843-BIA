import { SourceGraph } from '../types/dashboard.types'

interface Neo4JSourceGraphProps {
  graph?: SourceGraph
}

const positions: Record<string, { x: number; y: number }> = {
  profile: { x: 8, y: 42 },
  sleep: { x: 29, y: 8 },
  stress: { x: 29, y: 28 },
  bp: { x: 29, y: 48 },
  hr: { x: 29, y: 68 },
  bmi: { x: 29, y: 86 },
  body: { x: 29, y: 12 },
  goal: { x: 29, y: 34 },
  target: { x: 29, y: 56 },
  equipment: { x: 29, y: 78 },
  score: { x: 58, y: 42 },
  features: { x: 55, y: 42 },
  model: { x: 72, y: 42 },
  probability: { x: 86, y: 28 },
  output: { x: 86, y: 60 },
  band: { x: 78, y: 34 },
  cap: { x: 88, y: 62 },
}

const fallbackPosition = (index: number) => ({
  x: 15 + (index % 4) * 24,
  y: 20 + Math.floor(index / 4) * 26,
})

export default function Neo4JSourceGraph({ graph }: Neo4JSourceGraphProps) {
  if (!graph) {
    return <p className="muted">No graph data available.</p>
  }

  const nodePosition = (id: string, index: number) => positions[id] ?? fallbackPosition(index)
  const nodeIndex = new Map(graph.nodes.map((node, index) => [node.id, index]))

  return (
    <section className="neo-graph">
      <div className="neo-graph-canvas">
        <svg className="neo-graph-edges" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {graph.edges.map((edge) => {
            const sourceIndex = nodeIndex.get(edge.source) ?? 0
            const targetIndex = nodeIndex.get(edge.target) ?? 0
            const source = nodePosition(edge.source, sourceIndex)
            const target = nodePosition(edge.target, targetIndex)
            return (
              <line
                key={`${edge.source}-${edge.target}-${edge.label}`}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                vectorEffect="non-scaling-stroke"
              />
            )
          })}
        </svg>
        {graph.nodes.map((node, index) => {
          const position = nodePosition(node.id, index)
          return (
            <div
              key={node.id}
              className={`neo-node ${node.group}`}
              style={{ left: `${position.x}%`, top: `${position.y}%` }}
            >
              <span>{node.group}</span>
              <strong>{node.label}</strong>
            </div>
          )
        })}
      </div>
      <div className="neo-edge-list">
        {graph.edges.slice(-4).map((edge) => (
          <span key={`${edge.source}-${edge.target}-${edge.label}`}>
            {edge.source}{' -> '}{edge.target}: {edge.label}
          </span>
        ))}
      </div>
    </section>
  )
}
