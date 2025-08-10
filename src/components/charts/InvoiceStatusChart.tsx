import React from 'react';

interface InvoiceStatusChartProps {
  data: any[];
}

export default function InvoiceStatusChart({ data }: InvoiceStatusChartProps) {
  return (
    <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
      <p className="text-gray-500">Invoice Status Chart - Data: {data.length} items</p>
    </div>
  );
}
