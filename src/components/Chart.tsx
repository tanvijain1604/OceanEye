import React from 'react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { Card } from './Card'
import { 
  defaultChartConfig, 
  getChartColors, 
  mockWeatherData, 
  mockResourceData, 
  mockTrendsData,
  mockPredictiveData 
} from '../utils/charts'

interface ChartProps {
  data: any[]
  type: 'area' | 'bar' | 'line' | 'pie'
  title?: string
  className?: string
  height?: number
  config?: any
}

export const Chart: React.FC<ChartProps> = ({
  data,
  type,
  title,
  className = '',
  height = 300,
  config = defaultChartConfig
}) => {
  const colors = getChartColors(config)

  const renderChart = (): React.ReactElement => {
    const commonProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    }

    switch (type) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
            <XAxis dataKey="name" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #1E90FF',
                borderRadius: '8px'
              }} 
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="temperature"
              stackId="1"
              stroke={colors[0]}
              fill={colors[0]}
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="humidity"
              stackId="2"
              stroke={colors[1]}
              fill={colors[1]}
              fillOpacity={0.6}
            />
          </AreaChart>
        )

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
            <XAxis dataKey="name" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #1E90FF',
                borderRadius: '8px'
              }} 
            />
            <Legend />
            <Bar dataKey="available" fill={colors[0]} name="Available" />
            <Bar dataKey="allocated" fill={colors[1]} name="Allocated" />
            <Bar dataKey="remaining" fill={colors[2]} name="Remaining" />
          </BarChart>
        )

      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
            <XAxis dataKey="month" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #1E90FF',
                borderRadius: '8px'
              }} 
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="incidents" 
              stroke={colors[0]} 
              strokeWidth={2}
              dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="severity" 
              stroke={colors[1]} 
              strokeWidth={2}
              dot={{ fill: colors[1], strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        )

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}-${(entry as any)?.name ?? index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #1E90FF',
                borderRadius: '8px'
              }} 
            />
            <Legend />
          </PieChart>
        )

      default:
        return <div />
    }
  }

  return (
    <Card className={`p-6 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-primary-navy mb-4">{title}</h3>
      )}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

// Specialized chart components
export const WeatherChart: React.FC<{ data?: any[] }> = ({ data = mockWeatherData }) => (
  <Chart
    data={data}
    type="area"
    title="Weather Conditions"
    height={300}
  />
)

export const ResourceChart: React.FC<{ data?: any[] }> = ({ data = mockResourceData }) => (
  <Chart
    data={data}
    type="bar"
    title="Resource Allocation"
    height={300}
  />
)

export const TrendsChart: React.FC<{ data?: any[] }> = ({ data = mockTrendsData }) => (
  <Chart
    data={data}
    type="line"
    title="Incident Trends"
    height={300}
  />
)

export const PredictiveChart: React.FC<{ data?: any[] }> = ({ data = mockPredictiveData }) => {
  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString(),
    actual: item.actual,
    predicted: item.predicted,
    confidence: item.confidence
  }))

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-primary-navy mb-4">Predictive Analytics</h3>
      <div style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
            <XAxis dataKey="date" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #1E90FF',
                borderRadius: '8px'
              }} 
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="actual" 
              stroke="#1E90FF" 
              strokeWidth={2}
              dot={{ fill: '#1E90FF', strokeWidth: 2, r: 4 }}
              name="Actual"
            />
            <Line 
              type="monotone" 
              dataKey="predicted" 
              stroke="#4682B4" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#4682B4', strokeWidth: 2, r: 4 }}
              name="Predicted"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p>Confidence Level: {Math.round(data[0]?.confidence * 100)}%</p>
      </div>
    </Card>
  )
}


