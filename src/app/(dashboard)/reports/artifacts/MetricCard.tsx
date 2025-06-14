// Component 1: MetricCard.tsx
import { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend: string | ReactNode;
  trendColor: string;
  description?: string;
}

export default function MetricCard({ title, value, icon, trend, trendColor, description }: MetricCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2 text-gray-800 dark:text-white">{value}</p>
        </div>
        <span className="p-3 rounded-lg">{icon}</span>
      </div>
      <div className={`mt-4 flex items-center text-xs font-medium ${trendColor}`}>
        {trend}
      </div>
      {description && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}
    </div>
  );
}
