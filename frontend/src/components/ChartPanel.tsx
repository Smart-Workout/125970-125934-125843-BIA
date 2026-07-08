import { BarChart3 } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartData } from '../types/dashboard.types'

interface ChartPanelProps {
  title: string
  subtitle?: string
  data?: ChartData
  type?: 'bar' | 'pie' | 'line'
  legend?: string
  loading?: boolean
  chartHeight?: number
}

const colors = ['#176b87', '#2a9d8f', '#e9c46a', '#e76f51', '#7c3aed', '#0f766e', '#475569']

const formatTooltipValue = (value: number | string) => (
  typeof value === 'number' ? value.toLocaleString() : value
)

export default function ChartPanel({ title, subtitle, data, type = 'bar', legend, loading, chartHeight = 252 }: ChartPanelProps) {
  const chartData = data?.labels.map((label, index) => ({
    label,
    value: data.values[index] ?? 0,
  })) ?? []
  const total = chartData.reduce((sum, item) => sum + item.value, 0)
  const chartLegend = legend ?? (
    type === 'pie'
      ? 'Color legend'
      : type === 'line'
        ? 'X-axis shows month or category order. Y-axis shows the selected metric.'
        : 'X-axis shows category. Y-axis shows selected metric value.'
  )

  return (
    <section className="panel">
      <h3 className="panel-title">{title}</h3>
      {subtitle && <p className="chart-subtitle">{subtitle}</p>}
      {loading ? (
        <div className="chart-skeleton">
          {[70, 40, 90, 55, 80, 35, 65].map((h, i) => (
            <div key={i} className="skeleton chart-skeleton-bar" style={{ height: `${h}%` }} />
          ))}
        </div>
      ) : chartData.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><BarChart3 size={22} /></div>
          <p className="empty-state-title">No data available</p>
          <p className="empty-state-detail">Data will appear once the backend returns results for the selected filters.</p>
        </div>
      ) : (
        <div className={type === 'pie' ? 'chart-donut-layout' : 'chart-visual-frame'}>
          {type !== 'pie' && <div className="chart-inside-note">{chartLegend}</div>}
          {type === 'pie' ? (
            <div className="chart-donut-frame">
              <ResponsiveContainer width="100%" height={Math.max(chartHeight, 286)}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius="52%"
                    outerRadius="82%"
                    paddingAngle={2}
                    labelLine={false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={entry.label} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatTooltipValue(value as number), 'Value']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={chartHeight}>
              {type === 'line' ? (
                <LineChart data={chartData} margin={{ top: 26, right: 8, left: -16, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4ebf2" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => [formatTooltipValue(value as number), 'Value']} />
                  <Line type="monotone" dataKey="value" stroke="#176b87" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 26, right: 8, left: -16, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4ebf2" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => [formatTooltipValue(value as number), 'Value']} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={entry.label} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          )}
          {type === 'pie' && (
            <div className="chart-donut-legend">
              <p>{chartLegend}</p>
              {chartData.map((entry, index) => (
                <div key={entry.label} className="donut-legend-row">
                  <span className="donut-color-dot" style={{ background: colors[index % colors.length] }} />
                  <span className="donut-label" title={entry.label}>{entry.label}</span>
                  <strong>{total ? `${Math.round((entry.value / total) * 100)}%` : entry.value}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}

