"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function PortfolioSkeleton() {
  return (
    <div className="min-h-screen bg-background py-24">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header Skeleton */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="h-10 w-64 bg-muted rounded-lg animate-pulse mb-2"></div>
            <div className="h-5 w-80 bg-muted rounded animate-pulse"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 bg-muted rounded animate-pulse"></div>
            <div className="h-9 w-9 bg-muted rounded animate-pulse"></div>
            <div className="h-9 w-9 bg-muted rounded animate-pulse"></div>
            <div className="h-9 w-32 bg-muted rounded animate-pulse"></div>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-24 bg-muted rounded animate-pulse mb-1"></div>
                <div className="h-3 w-16 bg-muted rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-muted rounded animate-pulse"></div>
                  <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-muted rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Holdings Table Skeleton */}
        <Card>
          <CardHeader>
            <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-muted rounded-full animate-pulse"></div>
                    <div>
                      <div className="h-4 w-16 bg-muted rounded animate-pulse mb-1"></div>
                      <div className="h-3 w-20 bg-muted rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex gap-8">
                    <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                    <div className="flex gap-2">
                      <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
                      <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}