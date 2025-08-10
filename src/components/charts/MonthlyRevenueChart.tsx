import React from 'react';

interface MonthlyRevenueChartProps {
  data: any[];
}

export default function MonthlyRevenueChart({ data }: MonthlyRevenueChartProps) {
  return (
    <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
      <p className="text-gray-500">Monthly Revenue Chart - Data: {data.length} items</p>
    </div>
  );
}
