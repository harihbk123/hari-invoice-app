// src/components/expenses/BalanceCards.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

export default function BalanceCards() {
  // This would fetch real data from your store/API
  const balanceData = {
    totalBalance: 25000,
    monthlyIncome: 8500,
    monthlyExpenses: 3200,
    savingsGoal: 50000
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${balanceData.totalBalance.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Current available funds</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">${balanceData.monthlyIncome.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">This month's earnings</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">${balanceData.monthlyExpenses.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">This month's spending</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Savings Progress</CardTitle>
          <DollarSign className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {Math.round((balanceData.totalBalance / balanceData.savingsGoal) * 100)}%
          </div>
          <p className="text-xs text-muted-foreground">Of ${balanceData.savingsGoal.toLocaleString()} goal</p>
        </CardContent>
      </Card>
    </div>
  );
}
