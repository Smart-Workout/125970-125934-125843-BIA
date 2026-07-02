import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartData } from '../types/dashboard.types'

interface ChartPanelProps {
  title: string
  data?: ChartData
  type?: 'bar' | 'pie' | 'line'
  loading?: boolean
  xAxisLabel?: string
  yAxisLabel?: string
  description?: string
}

const colors = ['#176b87', '#2a9d8f', '#e9c46a', '#e76f51', '#7c3aed', '#0f766e', '#475569']

export default function ChartPanel({
  title,
  data,
  type = 'bar',
  loading,
  xAxisLabel,
  yAxisLabel,
  description,
}: ChartPanelProps) {
  const chartData = data?.labels.map((label, index) => ({
    label,
    value: data.values[index] ?? 0,
  })) ?? []

  const axisLabelStyle = { fontSize: 12, fill: '#475569', fontWeight: 600 }

  return (
    <section className="panel">
      <h3 className="panel-title">{title}</h3>
      {description ? <p className="muted" style={{ margin: '0 0 12px', fontSize: 13 }}>{description}</p> : null}
      {loading ? (
        <p className="muted">Loading chart...</p>
      ) : chartData.length === 0 ? (
        <p className="muted">No chart data available.</p>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          {type === 'pie' ? (
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="label" outerRadius={86} label>
                {chartData.map((entry, index) => (
                  <Cell key={entry.label} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          ) : type === 'line' ? (
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4ebf2" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -6, ...axisLabelStyle } : undefined} />
              <YAxis tick={{ fontSize: 11 }} label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', offset: 0, ...axisLabelStyle } : undefined} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#176b87" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4ebf2" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -6, ...axisLabelStyle } : undefined} />
              <YAxis tick={{ fontSize: 11 }} label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', offset: 0, ...axisLabelStyle } : undefined} />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={entry.label} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      )}
    </section>
  )
}

