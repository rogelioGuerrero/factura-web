import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList
} from 'recharts';

interface BarChartProps {
  data: Array<{ month: string; total: number }>;
}

const ReportsBarChart: React.FC<BarChartProps> = ({ data }) => {
  return (
    <div style={{ width: '100%', height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 13 }} />
          <YAxis tick={{ fontSize: 13 }} tickFormatter={v => `$${v.toLocaleString()}`} />
          <Tooltip formatter={v => `$${v.toLocaleString()}`} />
          <Bar dataKey="total" fill="#2563eb" radius={[8,8,0,0]}>
            <LabelList dataKey="total" position="top" formatter={v => `$${v.toLocaleString()}`} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ReportsBarChart;
