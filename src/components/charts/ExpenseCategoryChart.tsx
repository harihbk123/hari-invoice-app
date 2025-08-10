import React from 'react';

interface ExpenseCategoryChartProps {
  data: any[];
}

export default function ExpenseCategoryChart({ data }: ExpenseCategoryChartProps) {
  return (
    <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
      <p className="text-gray-500">Expense Category Chart - Data: {data.length} items</p>
    </div>
  );
}
