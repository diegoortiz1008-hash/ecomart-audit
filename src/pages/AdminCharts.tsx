import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { SALES_BY_MONTH } from '../data/sampleData'

/** Gráficos del panel (recharts ≈ 110 KB gz). Chunk independiente: solo lo descargan los admins. */
export default function AdminCharts() {
  return (
    <>
      <div className="h-72 rounded-2xl border bg-white p-4">
        <ResponsiveContainer>
          <BarChart data={SALES_BY_MONTH}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="ventas" fill="#059669" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="h-72 rounded-2xl border bg-white p-4">
        <ResponsiveContainer>
          <LineChart data={SALES_BY_MONTH}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line dataKey="co2" stroke="#0284c7" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  )
}
