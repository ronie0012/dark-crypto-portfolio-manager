"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, DollarSign, Target, Activity } from "lucide-react";

interface PortfolioStatsProps {
  totalInvested: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
  showValues: boolean;
  holdingsCount: number;
}

export function PortfolioStats({
  totalInvested,
  currentValue,
  profitLoss,
  profitLossPercent,
  showValues,
  holdingsCount,
}: PortfolioStatsProps) {
  const formatValue = (value: number) => {
    return showValues 
      ? `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
      : '••••••';
  };

  const formatPercent = (value: number) => {
    return showValues 
      ? `${value >= 0 ? "+" : ""}${value.toFixed(2)}%` 
      : '••••••';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatValue(currentValue)}</div>
          <p className="text-xs text-muted-foreground">Current portfolio value</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatValue(totalInvested)}</div>
          <p className="text-xs text-muted-foreground">Amount invested</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Profit/Loss</CardTitle>
          {profitLoss >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${profitLoss >= 0 ? "text-green-500" : "text-red-500"}`}>
            {showValues ? `${profitLoss >= 0 ? '+' : '-'}$${Math.abs(profitLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '••••••'}
          </div>
          <p className="text-xs text-muted-foreground">Unrealized P&L</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Return</CardTitle>
          {profitLoss >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${profitLoss >= 0 ? "text-green-500" : "text-red-500"}`}>
            {formatPercent(profitLossPercent)}
          </div>
          <p className="text-xs text-muted-foreground">Percentage return</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Holdings</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{holdingsCount}</div>
          <p className="text-xs text-muted-foreground">Assets tracked</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Return</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${profitLossPercent >= 0 ? "text-green-500" : "text-red-500"}`}>
            {formatPercent(profitLossPercent / (holdingsCount || 1))}
          </div>
          <p className="text-xs text-muted-foreground">Per holding</p>
        </CardContent>
      </Card>
    </div>
  );
}