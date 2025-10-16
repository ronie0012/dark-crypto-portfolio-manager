"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


import { TrendingUp, TrendingDown, Activity, PieChart as PieChartIcon, BarChart3 } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Header from "@/components/Header";
import { AnalyticsSkeleton } from "@/components/AnalyticsSkeleton";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart as RechartsLineChart,
  Line,
  Area,
  AreaChart,
  ComposedChart
} from "recharts";

interface Holding {
  id: number;
  userId: string;
  cryptoSymbol: string;
  cryptoName: string;
  amount: number;
  averagePurchasePrice: number;
  totalInvested: number;
  currentPrice: number;
  lastUpdated: number;
  createdAt: number;
}

interface Transaction {
  id: number;
  userId: string;
  cryptoSymbol: string;
  cryptoName: string;
  transactionType: string;
  amount: number;
  pricePerUnit: number;
  totalValue: number;
  transactionDate: number;
  notes: string | null;
  createdAt: number;
}

export default function AnalyticsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/sign-in");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchData();
    }
  }, [session]);

  const fetchData = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      const token = localStorage.getItem("bearer_token");
      const [holdingsRes, transactionsRes] = await Promise.all([
        fetch(`/api/holdings?userId=${session?.user?.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/transactions?userId=${session?.user?.id}&limit=100`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const holdingsData = await holdingsRes.json();
      const transactionsData = await transactionsRes.json();

      // Fetch real-time prices for all holdings
      if (holdingsData.length > 0) {
        const symbols = holdingsData.map((h: Holding) => h.cryptoSymbol.toLowerCase()).join(',');
        const pricesRes = await fetch(`/api/coingecko/prices?ids=${symbols}`);
        const prices = await pricesRes.json();

        // Update holdings with real-time prices
        const updatedHoldings = holdingsData.map((h: Holding) => ({
          ...h,
          currentPrice: prices[h.cryptoSymbol.toLowerCase()]?.usd || h.currentPrice,
        }));

        setHoldings(updatedHoldings);
        if (showRefreshToast) {
          toast.success("Analytics data refreshed");
        }
      } else {
        setHoldings(holdingsData);
      }

      setTransactions(transactionsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch analytics data");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const calculatePortfolioStats = () => {
    const totalInvested = holdings.reduce((sum, h) => sum + h.totalInvested, 0);
    const currentValue = holdings.reduce((sum, h) => sum + (h.amount * h.currentPrice), 0);
    const profitLoss = currentValue - totalInvested;
    const profitLossPercent = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

    const totalBuyVolume = transactions
      .filter(t => t.transactionType === "buy")
      .reduce((sum, t) => sum + t.totalValue, 0);

    const totalSellVolume = transactions
      .filter(t => t.transactionType === "sell")
      .reduce((sum, t) => sum + t.totalValue, 0);

    // Calculate additional metrics
    const bestPerformer = holdings.length > 0 ? holdings.reduce((best, current) => {
      const currentROI = ((current.amount * current.currentPrice) - current.totalInvested) / current.totalInvested * 100;
      const bestROI = ((best.amount * best.currentPrice) - best.totalInvested) / best.totalInvested * 100;
      return currentROI > bestROI ? current : best;
    }) : null;

    const worstPerformer = holdings.length > 0 ? holdings.reduce((worst, current) => {
      const currentROI = ((current.amount * current.currentPrice) - current.totalInvested) / current.totalInvested * 100;
      const worstROI = ((worst.amount * worst.currentPrice) - worst.totalInvested) / worst.totalInvested * 100;
      return currentROI < worstROI ? current : worst;
    }) : null;

    const avgHoldingValue = holdings.length > 0 ? currentValue / holdings.length : 0;
    const diversificationScore = holdings.length > 0 ? Math.min(holdings.length * 20, 100) : 0;

    return {
      totalInvested,
      currentValue,
      profitLoss,
      profitLossPercent,
      totalBuyVolume,
      totalSellVolume,
      transactionCount: transactions.length,
      bestPerformer,
      worstPerformer,
      avgHoldingValue,
      diversificationScore,
      holdingsCount: holdings.length
    };
  };

  const stats = calculatePortfolioStats();

  const portfolioAllocation = holdings.map(holding => {
    const value = holding.amount * holding.currentPrice;
    const percentage = stats.currentValue > 0 ? (value / stats.currentValue) * 100 : 0;
    const profitLoss = value - holding.totalInvested;
    const roi = holding.totalInvested > 0 ? (profitLoss / holding.totalInvested) * 100 : 0;
    return {
      symbol: holding.cryptoSymbol,
      name: holding.cryptoName,
      value,
      percentage,
      profitLoss,
      roi,
      invested: holding.totalInvested
    };
  }).sort((a, b) => b.value - a.value);

  // Prepare chart data
  const pieChartData = portfolioAllocation.map((asset, index) => ({
    name: asset.symbol,
    value: asset.value,
    percentage: asset.percentage,
    color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`,
  }));

  const performanceChartData = portfolioAllocation.map(asset => ({
    name: asset.symbol,
    invested: asset.invested,
    current: asset.value,
    profit: asset.profitLoss,
    roi: asset.roi
  }));



  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];



  if (isPending || isLoading) {
    return (
      <>
        <Header />
        <AnalyticsSkeleton />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background py-24">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Portfolio Analytics</h1>
            <p className="text-muted-foreground">Deep insights into your investment performance</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Return</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stats.profitLoss >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {stats.profitLossPercent >= 0 ? "+" : ""}{stats.profitLossPercent.toFixed(2)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.profitLoss >= 0 ? "+" : ""}${Math.abs(stats.profitLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.transactionCount}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Buy: {transactions.filter(t => t.transactionType === "buy").length} | Sell: {transactions.filter(t => t.transactionType === "sell").length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Buy Volume</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalBuyVolume.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                <p className="text-xs text-muted-foreground mt-1">Total purchases</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sell Volume</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalSellVolume.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                <p className="text-xs text-muted-foreground mt-1">Total sales</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Portfolio Allocation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Portfolio Allocation
                </CardTitle>
              </CardHeader>
              <CardContent>
                {portfolioAllocation.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No holdings to display</p>
                ) : (
                  <div className="space-y-4">
                    {portfolioAllocation.map((asset) => (
                      <div key={asset.symbol} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{asset.symbol}</div>
                            <div className="text-sm text-muted-foreground">{asset.name}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{asset.percentage.toFixed(2)}%</div>
                            <div className="text-sm text-muted-foreground">
                              ${asset.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                          </div>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${asset.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No transactions yet</p>
                ) : (
                  <div className="space-y-4">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between pb-4 border-b last:border-0">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{transaction.cryptoSymbol}</span>
                            <span className={`text-xs px-2 py-1 rounded ${transaction.transactionType === "buy"
                              ? "bg-green-500/10 text-green-500"
                              : "bg-red-500/10 text-red-500"
                              }`}>
                              {transaction.transactionType.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {new Date(transaction.transactionDate * 1000).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            ${transaction.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.amount} @ ${transaction.pricePerUnit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Performance by Asset */}
          <Card>
            <CardHeader>
              <CardTitle>Performance by Asset</CardTitle>
            </CardHeader>
            <CardContent>
              {holdings.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No holdings to analyze</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Asset</th>
                        <th className="text-right py-3 px-4 font-medium">Invested</th>
                        <th className="text-right py-3 px-4 font-medium">Current Value</th>
                        <th className="text-right py-3 px-4 font-medium">P&L</th>
                        <th className="text-right py-3 px-4 font-medium">ROI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {holdings.map((holding) => {
                        const currentValue = holding.amount * holding.currentPrice;
                        const profitLoss = currentValue - holding.totalInvested;
                        const roi = (profitLoss / holding.totalInvested) * 100;

                        return (
                          <tr key={holding.id} className="border-b hover:bg-muted/50">
                            <td className="py-4 px-4">
                              <div className="font-semibold">{holding.cryptoSymbol}</div>
                              <div className="text-sm text-muted-foreground">{holding.cryptoName}</div>
                            </td>
                            <td className="text-right py-4 px-4">
                              ${holding.totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="text-right py-4 px-4 font-semibold">
                              ${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className={`text-right py-4 px-4 font-semibold ${profitLoss >= 0 ? "text-green-500" : "text-red-500"}`}>
                              {profitLoss >= 0 ? "+" : ""}${Math.abs(profitLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className={`text-right py-4 px-4 font-semibold ${roi >= 0 ? "text-green-500" : "text-red-500"}`}>
                              {roi >= 0 ? "+" : ""}{roi.toFixed(2)}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}