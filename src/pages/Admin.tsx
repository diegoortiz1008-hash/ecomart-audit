import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { SALES_BY_MONTH } from '../data/sampleData'
import { getCurrentRole } from '../services/api'

export default function Admin() {
  const [role, setRole] = useState<string>()
  useEffect(() => {
    getCurrentRole().then(setRole)
  }, [])
  if (role !== 'admin') return <p className="text-stone-600">Acceso solo para administradores.</p>
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Panel de administración</h1>
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
    </div>
  )
}
