"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

export function ChatDebug() {
  const { data: session } = useSession();
  const [isTestingSSE, setIsTestingSSE] = useState(false);
  const [sseStatus, setSseStatus] = useState<string>("Not connected");
  const [lastMessage, setLastMessage] = useState<string>("");

  const testSSEConnection = () => {
    if (!session?.user) {
      toast.error("Please sign in first");
      return;
    }

    setIsTestingSSE(true);
    setSseStatus("Connecting...");

    const eventSource = new EventSource(
      `/api/chat/sse?userId=${session.user.id}&username=${encodeURIComponent(session.user.name || 'TestUser')}`
    );

    eventSource.onopen = () => {
      setSseStatus("Connected ✅");
      toast.success("SSE connection established");
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(`${data.type}: ${JSON.stringify(data.data)}`);
        console.log("SSE message received:", data);
      } catch (error) {
        console.error("Error parsing SSE message:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      setSseStatus("Error ❌");
      toast.error("SSE connection failed");
      eventSource.close();
      setIsTestingSSE(false);
    };

    // Close connection after 10 seconds
    setTimeout(() => {
      eventSource.close();
      setIsTestingSSE(false);
      setSseStatus("Disconnected");
    }, 10000);
  };

  const testMessageSend = async () => {
    if (!session?.user) {
      toast.error("Please sign in first");
      return;
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user.id,
          username: session.user.name || "TestUser",
          message: `Test message from ${session.user.name} at ${new Date().toLocaleTimeString()}`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Message sent successfully");
        console.log("Message sent:", data);
      } else {
        toast.error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error sending message");
    }
  };

  const fetchMessages = async () => {
    if (!session?.user) {
      toast.error("Please sign in first");
      return;
    }

    try {
      const response = await fetch(`/api/chat?userId=${session.user.id}&limit=10`);
      const data = await response.json();
      console.log("Fetched messages:", data);
      toast.success(`Fetched ${data.messages?.length || 0} messages`);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Error fetching messages");
    }
  };

  if (!session?.user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Please sign in to test chat functionality</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chat Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">SSE Status:</span>
          <Badge variant="outline">{sseStatus}</Badge>
        </div>
        
        {lastMessage && (
          <div className="text-xs bg-muted p-2 rounded">
            <strong>Last SSE Message:</strong><br />
            {lastMessage}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={testSSEConnection} 
            disabled={isTestingSSE}
            size="sm"
          >
            {isTestingSSE ? "Testing..." : "Test SSE Connection"}
          </Button>
          
          <Button 
            onClick={testMessageSend}
            size="sm"
            variant="outline"
          >
            Send Test Message
          </Button>
          
          <Button 
            onClick={fetchMessages}
            size="sm"
            variant="outline"
          >
            Fetch Messages
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p><strong>User ID:</strong> {session.user.id}</p>
          <p><strong>Username:</strong> {session.user.name || "Anonymous"}</p>
        </div>
      </CardContent>
    </Card>
  );
}