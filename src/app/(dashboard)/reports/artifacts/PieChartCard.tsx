import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Filter } from 'lucide-react';

interface PieChartCardProps {
  title: string;
  data: { name: string; value: number; color: string }[];
  tooltipFormatter?: (value: number) => string;
  showFilterButton?: boolean;
  labels?: string[];
  customLegend?: React.ReactNode;
}

const PieChartCard: React.FC<PieChartCardProps> = ({
  title,
  data,
  tooltipFormatter = (value) => `${value}`,
  showFilterButton = true,
  // labels,
  customLegend
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{title}</h2>
        {showFilterButton && (
          <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <Filter size={18} />
          </button>
        )}
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={tooltipFormatter} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {customLegend && <div className="mt-4 grid grid-cols-2 gap-4">{customLegend}</div>}
    </div>
  );
};

export default PieChartCard;
