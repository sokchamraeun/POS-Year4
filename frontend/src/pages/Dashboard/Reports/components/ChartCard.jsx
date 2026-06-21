import { ResponsiveContainer } from 'recharts'
import Card from './Card.jsx'

export default function ChartCard({ title, subtitle, height = 280, children }) {
  return (
    <Card title={title} subtitle={subtitle}>
      <div className="p-4" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
