import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Lead } from '../../types/crm';

interface LeadSourceChartProps {
  leads: Lead[];
}

export const LeadSourceChart: React.FC<LeadSourceChartProps> = ({ leads }) => {
  const sourceCounts: Record<string, number> = {};

  leads.forEach((l) => {
    const src = l.source || 'Direct';
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  });

  const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  const data = Object.entries(sourceCounts).map(([name, value]) => ({
    name,
    value,
  }));

  if (data.length === 0) {
    data.push({ name: 'Website Inbound', value: 4 }, { name: 'Referral', value: 3 }, { name: 'Trade Show', value: 2 });
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="46%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: unknown) => [`${value} Leads`, 'Total Leads']}
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
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
