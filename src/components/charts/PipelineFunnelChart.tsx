import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Deal, DealStage } from '../../types/crm';
import { formatINR, formatINRCompact } from '../../utils/formatCurrency';

interface PipelineFunnelChartProps {
  deals: Deal[];
}

export const PipelineFunnelChart: React.FC<PipelineFunnelChartProps> = ({ deals }) => {
  const stages: DealStage[] = ['Discovery', 'Qualification', 'Proposal', 'Negotiation', 'Won', 'Lost'];

  const stageColors: Record<DealStage, string> = {
    Discovery: '#94a3b8',
    Qualification: '#38bdf8',
    Proposal: '#818cf8',
    Negotiation: '#f59e0b',
    Won: '#10b981',
    Lost: '#f43f5e',
  };

  const data = stages.map((st) => {
    const matching = deals.filter((d) => d.stage === st);
    const totalValue = matching.reduce((sum, d) => sum + (d.value || 0), 0);
    return {
      stage: st,
      count: matching.length,
      value: totalValue,
    };
  });

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
          <XAxis
            dataKey="stage"
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
            formatter={(value: unknown, name: unknown, item: any) => [
              `${formatINR(Number(value || 0))} (${item.payload.count} deals)`,
              'Pipeline Value',
            ]}
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#1e293b',
              borderRadius: '0.75rem',
              color: '#f8fafc',
              fontSize: '11px',
            }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell key={`bar-${entry.stage}`} fill={stageColors[entry.stage as DealStage]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
