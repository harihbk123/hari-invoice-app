import React from 'react';

interface ClientDistributionChartProps {
  data: any[];
}

export default function ClientDistributionChart({ data }: ClientDistributionChartProps) {
  return (
    <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
      <p className="text-gray-500">Client Distribution Chart - Data: {data.length} items</p>
    </div>
  );
}
