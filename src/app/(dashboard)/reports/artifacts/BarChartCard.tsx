"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Filter } from "lucide-react";

interface BarChartCardProps {
  title: string;
  data: unknown[];
  bars: { dataKey: string; name: string; color: string }[];
  controls?: React.ReactNode;
}

export default function BarChartCard({ title, data, bars, controls }: BarChartCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{title}</h2>
        {controls || (
          <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <Filter size={18} />
          </button>
        )}
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {bars.map((bar, index) => (
              <Bar key={index} dataKey={bar.dataKey} name={bar.name} fill={bar.color} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
