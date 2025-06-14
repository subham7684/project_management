"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Filter } from "lucide-react";

interface AreaChartCardProps {
  title: string;
  data: unknown[];
  areas: {
    dataKey: string;
    name: string;
    stroke: string;
    fill: string;
  }[];
  controls?: React.ReactNode;
}

export default function AreaChartCard({ title, data, areas, controls }: AreaChartCardProps) {
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
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {areas.map((area, index) => (
              <Area
                key={index}
                type="monotone"
                dataKey={area.dataKey}
                stackId="1"
                stroke={area.stroke}
                fill={area.fill}
                name={area.name}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
