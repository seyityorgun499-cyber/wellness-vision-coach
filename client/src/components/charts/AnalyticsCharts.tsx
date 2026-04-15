import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';

interface WeightChartProps {
  data: Array<{ day: string; weight: number; calories: number }>;
}

export function WeightTrendChart({ data }: WeightChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} role="img" aria-label="Haftalık kilo ve kalori trend grafiği">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis yAxisId="left" domain={['auto', 'auto']} />
        <YAxis yAxisId="right" orientation="right" domain={['auto', 'auto']} />
        <Tooltip />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="weight"
          stroke="hsl(var(--primary))"
          strokeWidth={3}
          name="Kilo (kg)"
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="calories"
          stroke="hsl(var(--warning))"
          strokeWidth={2}
          strokeDasharray="5 5"
          name="Kalori"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface MacroChartProps {
  data: Array<{ name: string; value: number; color: string }>;
}

export function MacroDistributionChart({ data }: MacroChartProps) {
  return (
    <ResponsiveContainer width="60%" height={150}>
      <PieChart role="img" aria-label="Makro besin dağılımı grafiği">
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={30}
          outerRadius={60}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface MonthlyProgressChartProps {
  data: Array<{ month: string; fastingDays: number; calories?: number }>;
}

export function MonthlyProgressChart({ data }: MonthlyProgressChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} role="img" aria-label="Aylık ilerleme grafiği">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="fastingDays" fill="hsl(var(--primary))" name="Oruç Günü" />
      </BarChart>
    </ResponsiveContainer>
  );
}
