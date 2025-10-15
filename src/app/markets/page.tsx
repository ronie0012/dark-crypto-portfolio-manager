"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TrendingUp, TrendingDown, Search } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";

interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  image: string;
}

export default function MarketsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [markets, setMarkets] = useState<CryptoAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMarketData();
    // Refresh every 60 seconds
    const interval = setInterval(fetchMarketData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchMarketData = async () => {
    try {
      const response = await fetch("/api/coingecko/coins?per_page=50");
      if (!response.ok) throw new Error("Failed to fetch market data");
      
      const data = await response.json();
      setMarkets(data);
    } catch (error) {
      toast.error("Failed to fetch market data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMarkets = markets.filter(
    (asset) =>
      asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  const formatMarketCap = (num: number) => {
    if (num >= 1000000000000) {
      return `$${(num / 1000000000000).toFixed(2)}T`;
    } else if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(2)}B`;
    } else if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`;
    }
    return `$${formatNumber(num, 0)}`;
  };

  if (isLoading) {
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

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background py-24">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Crypto Markets</h1>
            <p className="text-muted-foreground">Browse and track cryptocurrency prices in real-time</p>
          </div>

          {/* Search Bar */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search cryptocurrencies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Market Data Table */}
          <Card>
            <CardHeader>
              <CardTitle>Top Cryptocurrencies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">#</th>
                      <th className="text-left py-3 px-4 font-medium">Name</th>
                      <th className="text-right py-3 px-4 font-medium">Price</th>
                      <th className="text-right py-3 px-4 font-medium">24h Change</th>
                      <th className="text-right py-3 px-4 font-medium">Market Cap</th>
                      <th className="text-right py-3 px-4 font-medium">24h Volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMarkets.map((asset, index) => (
                      <tr key={asset.id} className="border-b hover:bg-muted/50">
                        <td className="py-4 px-4 text-muted-foreground">{index + 1}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <img src={asset.image} alt={asset.name} className="w-6 h-6" />
                            <div>
                              <div className="font-semibold">{asset.symbol.toUpperCase()}</div>
                              <div className="text-sm text-muted-foreground">{asset.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-right py-4 px-4 font-semibold">
                          ${formatNumber(asset.current_price, asset.current_price < 1 ? 4 : 2)}
                        </td>
                        <td className="text-right py-4 px-4">
                          <div className={`flex items-center justify-end gap-1 ${asset.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {asset.price_change_percentage_24h >= 0 ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                            <span className="font-semibold">
                              {asset.price_change_percentage_24h >= 0 ? "+" : ""}{asset.price_change_percentage_24h.toFixed(2)}%
                            </span>
                          </div>
                        </td>
                        <td className="text-right py-4 px-4">{formatMarketCap(asset.market_cap)}</td>
                        <td className="text-right py-4 px-4 text-muted-foreground">
                          {formatMarketCap(asset.total_volume)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredMarkets.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No cryptocurrencies found matching your search.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}