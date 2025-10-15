"use client";

import { useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { ChatBox } from "@/components/chat/ChatBox";
import { ChatDebug } from "@/components/chat/ChatDebug";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Users, TrendingUp, Activity } from "lucide-react";

export default function ChatPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/sign-in");
    }
  }, [session, isPending, router]);

  if (isPending) {
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

  if (!session?.user) {
    return null;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background py-24">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Community Chat</h1>
            <p className="text-muted-foreground">
              Connect with other crypto investors and traders in real-time
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chat Guidelines */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Chat Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                    <p>Be respectful to all community members</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                    <p>Share insights and analysis, not financial advice</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                    <p>No spam, promotional content, or excessive links</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                    <p>Keep discussions crypto and trading related</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Popular Topics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Bitcoin Analysis</span>
                    <span className="text-muted-foreground">24 msgs</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Altcoin Discussions</span>
                    <span className="text-muted-foreground">18 msgs</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Market Predictions</span>
                    <span className="text-muted-foreground">15 msgs</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Trading Strategies</span>
                    <span className="text-muted-foreground">12 msgs</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Messages Today</span>
                    <span className="font-semibold">127</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active Users</span>
                    <span className="font-semibold">23</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Peak Online</span>
                    <span className="font-semibold">45</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Chat */}
            <div className="lg:col-span-3 space-y-6">
              <ChatBox className="h-[600px] max-w-none" />
              
              {/* Debug Panel - Remove in production */}
              <ChatDebug />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}