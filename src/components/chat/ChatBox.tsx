"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { ChatMessage } from "./ChatMessage";
import { Send, Users, MessageCircle, Minimize2, Maximize2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: number;
  isOwn?: boolean;
}

interface ChatBoxProps {
  className?: string;
  defaultMinimized?: boolean;
}

export function ChatBox({ className, defaultMinimized = false }: ChatBoxProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [isMinimized, setIsMinimized] = useState(defaultMinimized);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!session?.user) return;

    // Fetch initial messages
    fetchMessages();

    // Setup SSE connection for real-time updates
    setupEventSource();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [session?.user]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/chat?userId=${session?.user?.id}&limit=50`);
      const data = await response.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load chat messages");
    }
  };

  const setupEventSource = () => {
    if (!session?.user) return;

    const eventSource = new EventSource(
      `/api/chat/sse?userId=${session.user.id}&username=${encodeURIComponent(session.user.name || 'Anonymous')}`
    );

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'message':
            setMessages(prev => {
              const messageExists = prev.some(msg => msg.id === data.data.id);
              if (messageExists) return prev;
              
              return [...prev, {
                ...data.data,
                isOwn: data.data.userId === session?.user?.id
              }];
            });
            break;
            
          case 'userCount':
            setUserCount(data.data.count);
            break;
            
          case 'connected':
            setIsConnected(true);
            break;
            
          case 'heartbeat':
            // Keep connection alive
            break;
        }
      } catch (error) {
        console.error("Error parsing SSE message:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
      setIsConnected(false);
      eventSource.close();
      
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        console.log("Attempting to reconnect to chat...");
        setupEventSource();
      }, 3000);
    };

    eventSourceRef.current = eventSource;
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !session?.user || isSending) return;

    setIsSending(true);
    
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user.id,
          username: session.user.name || "Anonymous",
          message: newMessage.trim(),
        }),
      });

      if (response.ok) {
        setNewMessage("");
      } else {
        toast.error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  if (!session?.user) {
    return null;
  }

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="h-5 w-5" />
            Community Chat
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {userCount}
            </Badge>
            <div className={cn(
              "w-2 h-2 rounded-full",
              isConnected ? "bg-green-500" : "bg-red-500"
            )} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {!isMinimized && (
        <CardContent className="p-0">
          <div className="h-80 overflow-y-auto px-4">
            <div className="space-y-2">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    id={message.id}
                    username={message.username}
                    message={message.message}
                    timestamp={message.timestamp}
                    isOwn={message.isOwn || false}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          <div className="p-4 border-t">
            <form onSubmit={sendMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={!isConnected || isSending}
                maxLength={500}
                className="flex-1"
              />
              <Button 
                type="submit" 
                size="sm" 
                disabled={!newMessage.trim() || !isConnected || isSending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            {!isConnected && (
              <p className="text-xs text-muted-foreground mt-2">
                Reconnecting to chat...
              </p>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}