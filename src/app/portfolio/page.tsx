"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Wallet, DollarSign, Plus, Trash2, Edit } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Header from "@/components/Header";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

export default function PortfolioPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState<Holding | null>(null);
  const [formData, setFormData] = useState({
    cryptoSymbol: "",
    cryptoName: "",
    amount: "",
    averagePurchasePrice: "",
  });

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/sign-in");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchHoldings();
    }
  }, [session]);

  const fetchHoldings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/holdings?userId=${session?.user?.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch holdings");
      }

      const data = await response.json();
      
      // Fetch real-time prices for all holdings
      if (data.length > 0) {
        const symbols = data.map((h: Holding) => h.cryptoSymbol.toLowerCase()).join(',');
        const pricesRes = await fetch(`/api/coingecko/prices?ids=${symbols}`);
        const prices = await pricesRes.json();
        
        // Update holdings with real-time prices
        const updatedHoldings = data.map((h: Holding) => ({
          ...h,
          currentPrice: prices[h.cryptoSymbol.toLowerCase()]?.usd || h.currentPrice,
        }));
        
        setHoldings(updatedHoldings);
      } else {
        setHoldings(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error("Failed to fetch holdings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddHolding = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const totalInvested = parseFloat(formData.amount) * parseFloat(formData.averagePurchasePrice);
      
      const response = await fetch("/api/holdings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: session?.user?.id,
          cryptoSymbol: formData.cryptoSymbol.toUpperCase(),
          cryptoName: formData.cryptoName,
          amount: parseFloat(formData.amount),
          averagePurchasePrice: parseFloat(formData.averagePurchasePrice),
          totalInvested,
          currentPrice: parseFloat(formData.averagePurchasePrice),
        }),
      });

      if (!response.ok) throw new Error("Failed to add holding");

      toast.success("Holding added successfully");
      setIsAddDialogOpen(false);
      setFormData({ cryptoSymbol: "", cryptoName: "", amount: "", averagePurchasePrice: "" });
      fetchHoldings();
    } catch (err) {
      toast.error("Failed to add holding");
    }
  };

  const handleEditHolding = async () => {
    if (!selectedHolding) return;
    
    try {
      const token = localStorage.getItem("bearer_token");
      const totalInvested = parseFloat(formData.amount) * parseFloat(formData.averagePurchasePrice);
      
      const response = await fetch(`/api/holdings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: selectedHolding.id,
          amount: parseFloat(formData.amount),
          averagePurchasePrice: parseFloat(formData.averagePurchasePrice),
          totalInvested,
        }),
      });

      if (!response.ok) throw new Error("Failed to update holding");

      toast.success("Holding updated successfully");
      setIsEditDialogOpen(false);
      setSelectedHolding(null);
      setFormData({ cryptoSymbol: "", cryptoName: "", amount: "", averagePurchasePrice: "" });
      fetchHoldings();
    } catch (err) {
      toast.error("Failed to update holding");
    }
  };

  const handleDeleteHolding = async (id: number) => {
    if (!confirm("Are you sure you want to delete this holding?")) return;
    
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/holdings?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete holding");

      toast.success("Holding deleted successfully");
      fetchHoldings();
    } catch (err) {
      toast.error("Failed to delete holding");
    }
  };

  const openEditDialog = (holding: Holding) => {
    setSelectedHolding(holding);
    setFormData({
      cryptoSymbol: holding.cryptoSymbol,
      cryptoName: holding.cryptoName,
      amount: holding.amount.toString(),
      averagePurchasePrice: holding.averagePurchasePrice.toString(),
    });
    setIsEditDialogOpen(true);
  };

  const calculateTotals = () => {
    const totalInvested = holdings.reduce((sum, h) => sum + h.totalInvested, 0);
    const currentValue = holdings.reduce((sum, h) => sum + (h.amount * h.currentPrice), 0);
    const profitLoss = currentValue - totalInvested;
    const profitLossPercent = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

    return { totalInvested, currentValue, profitLoss, profitLossPercent };
  };

  const { totalInvested, currentValue, profitLoss, profitLossPercent } = calculateTotals();

  if (isPending || isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background py-24">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background py-24">
          <div className="container mx-auto px-6">
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <p className="text-destructive text-center">Error: {error}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background py-24">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Portfolio Overview</h1>
              <p className="text-muted-foreground">Track your crypto investments in real-time</p>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Holding
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </CardContent>
            </Card>

            <Card>
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
                  ${Math.abs(profitLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>

            <Card>
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
                  {profitLossPercent >= 0 ? "+" : ""}{profitLossPercent.toFixed(2)}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Holdings Table */}
          <Card>
            <CardHeader>
              <CardTitle>Your Holdings</CardTitle>
            </CardHeader>
            <CardContent>
              {holdings.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No holdings found. Start by adding your first crypto!</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Asset</th>
                        <th className="text-right py-3 px-4 font-medium">Amount</th>
                        <th className="text-right py-3 px-4 font-medium">Avg. Price</th>
                        <th className="text-right py-3 px-4 font-medium">Current Price</th>
                        <th className="text-right py-3 px-4 font-medium">Total Value</th>
                        <th className="text-right py-3 px-4 font-medium">Profit/Loss</th>
                        <th className="text-right py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {holdings.map((holding) => {
                        const currentValue = holding.amount * holding.currentPrice;
                        const profitLoss = currentValue - holding.totalInvested;
                        const profitLossPercent = (profitLoss / holding.totalInvested) * 100;

                        return (
                          <tr key={holding.id} className="border-b hover:bg-muted/50">
                            <td className="py-4 px-4">
                              <div>
                                <div className="font-semibold">{holding.cryptoSymbol}</div>
                                <div className="text-sm text-muted-foreground">{holding.cryptoName}</div>
                              </div>
                            </td>
                            <td className="text-right py-4 px-4">
                              {holding.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                            </td>
                            <td className="text-right py-4 px-4">
                              ${holding.averagePurchasePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="text-right py-4 px-4">
                              ${holding.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="text-right py-4 px-4 font-semibold">
                              ${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="text-right py-4 px-4">
                              <div className={profitLoss >= 0 ? "text-green-500" : "text-red-500"}>
                                <div className="font-semibold">
                                  {profitLoss >= 0 ? "+" : ""}${Math.abs(profitLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                                <div className="text-sm">
                                  {profitLoss >= 0 ? "+" : ""}{profitLossPercent.toFixed(2)}%
                                </div>
                              </div>
                            </td>
                            <td className="text-right py-4 px-4">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(holding)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteHolding(holding.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
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

        {/* Add Holding Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Holding</DialogTitle>
              <DialogDescription>
                Add a cryptocurrency to your portfolio
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="symbol">Symbol (e.g., BTC)</Label>
                <Input
                  id="symbol"
                  value={formData.cryptoSymbol}
                  onChange={(e) => setFormData({ ...formData, cryptoSymbol: e.target.value })}
                  placeholder="BTC"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Name (e.g., Bitcoin)</Label>
                <Input
                  id="name"
                  value={formData.cryptoName}
                  onChange={(e) => setFormData({ ...formData, cryptoName: e.target.value })}
                  placeholder="Bitcoin"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.00000001"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.5"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Average Purchase Price (USD)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.averagePurchasePrice}
                  onChange={(e) => setFormData({ ...formData, averagePurchasePrice: e.target.value })}
                  placeholder="50000"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddHolding}>Add Holding</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Holding Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Holding</DialogTitle>
              <DialogDescription>
                Update your {formData.cryptoSymbol} holding
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-amount">Amount</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  step="0.00000001"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Average Purchase Price (USD)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={formData.averagePurchasePrice}
                  onChange={(e) => setFormData({ ...formData, averagePurchasePrice: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditHolding}>Update Holding</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}