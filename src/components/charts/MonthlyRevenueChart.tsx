// src/components/charts/MonthlyRevenueChart.tsx
import React from 'react';

interface MonthlyRevenueChartProps {
  data: any[];
}

export function MonthlyRevenueChart({ data }: MonthlyRevenueChartProps) {
  return (
    <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
      <p className="text-gray-500">Monthly Revenue Chart - Data: {data.length} items</p>
    </div>
  );
}

// src/components/charts/ClientDistributionChart.tsx
interface ClientDistributionChartProps {
  data: any[];
}

export function ClientDistributionChart({ data }: ClientDistributionChartProps) {
  return (
    <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
      <p className="text-gray-500">Client Distribution Chart - Data: {data.length} items</p>
    </div>
  );
}

// src/components/charts/InvoiceStatusChart.tsx
interface InvoiceStatusChartProps {
  data: any[];
}

export function InvoiceStatusChart({ data }: InvoiceStatusChartProps) {
  return (
    <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
      <p className="text-gray-500">Invoice Status Chart - Data: {data.length} items</p>
    </div>
  );
}

// src/components/charts/ExpenseCategoryChart.tsx
interface ExpenseCategoryChartProps {
  data: any[];
}

export function ExpenseCategoryChart({ data }: ExpenseCategoryChartProps) {
  return (
    <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
      <p className="text-gray-500">Expense Category Chart - Data: {data.length} items</p>
    </div>
  );
}

// Default exports
export default MonthlyRevenueChart;
export { ClientDistributionChart as default };
export { InvoiceStatusChart as default };
export { ExpenseCategoryChart as default };
