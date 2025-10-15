"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  id: string;
  username: string;
  message: string;
  timestamp: number;
  isOwn: boolean;
  avatar?: string;
}

export function ChatMessage({ username, message, timestamp, isOwn, avatar }: ChatMessageProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className={cn(
      "flex gap-3 p-3 rounded-lg transition-colors hover:bg-muted/50",
      isOwn ? "flex-row-reverse" : "flex-row"
    )}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className="text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          {username.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className={cn("flex flex-col gap-1 max-w-[70%]", isOwn ? "items-end" : "items-start")}>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {!isOwn && <span className="font-medium">{username}</span>}
          <span>{formatTime(timestamp)}</span>
        </div>
        
        <div className={cn(
          "px-3 py-2 rounded-lg text-sm break-words",
          isOwn 
            ? "bg-primary text-primary-foreground ml-auto" 
            : "bg-muted"
        )}>
          {message}
        </div>
      </div>
    </div>
  );
}