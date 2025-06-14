import React from "react";

interface SummaryInsightProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBg: string;
  iconColor: string;
}

export default function SummaryInsight({
  icon,
  title,
  description,
  iconBg,
  iconColor
}: SummaryInsightProps) {
  return (
    <div className="flex items-start space-x-4">
      <div className={`p-3 rounded-lg ${iconBg} ${iconColor}`}>
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-gray-800 dark:text-white">{title}</h3>
        <p className="mt-1 text-gray-600 dark:text-gray-300">{description}</p>
      </div>
    </div>
  );
}
