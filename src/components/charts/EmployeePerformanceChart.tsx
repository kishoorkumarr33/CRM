import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Employee, Deal, Task } from '../../types/crm';
import { formatINR, formatINRCompact } from '../../utils/formatCurrency';

interface EmployeePerformanceChartProps {
  employees: Employee[];
  deals: Deal[];
  tasks: Task[];
}

export const EmployeePerformanceChart: React.FC<EmployeePerformanceChartProps> = ({
  employees,
  deals,
  tasks,
}) => {
  const data = employees.slice(0, 5).map((emp) => {
    // Won revenue
    const wonRevenue = deals
      .filter((d) => (d.assignedEmployeeId === emp.id || d.assignedEmployeeName === emp.name) && d.stage === 'Won')
      .reduce((sum, d) => sum + (d.value || 0), 0);

    // Active pipeline
    const pipelineRevenue = deals
      .filter((d) => (d.assignedEmployeeId === emp.id || d.assignedEmployeeName === emp.name) && d.stage !== 'Won' && d.stage !== 'Lost')
      .reduce((sum, d) => sum + (d.value || 0), 0);

    const completedTasks = tasks.filter(
      (t) => (t.assignedEmployeeId === emp.id || t.assignedEmployeeName === emp.name) && t.status === 'Completed'
    ).length;

    return {
      name: emp.name.split(' ')[0], // First name
      fullName: emp.name,
      wonRevenue,
      pipelineRevenue,
      completedTasks,
    };
  });

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickFormatter={(val) => formatINRCompact(val)}
          />
          <Tooltip
            formatter={(value: unknown, name: unknown) => [
              formatINR(Number(value || 0)),
              name === 'wonRevenue' ? 'Won Sales' : 'Active Pipeline',
            ]}
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#1e293b',
              borderRadius: '0.75rem',
              color: '#f8fafc',
              fontSize: '11px',
            }}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
          />
          <Bar dataKey="wonRevenue" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Won Revenue (₹)" />
          <Bar dataKey="pipelineRevenue" fill="#38bdf8" radius={[4, 4, 0, 0]} name="Pipeline Volume (₹)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
