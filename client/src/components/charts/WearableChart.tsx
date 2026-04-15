import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface WearableChartProps {
  data: Array<{ timestamp: string; value: number }>;
}

export function WearableLineChart({ data }: WearableChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} role="img" aria-label="Giyilebilir cihaz veri grafiği">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timestamp" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="value"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
