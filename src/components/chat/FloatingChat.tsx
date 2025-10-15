"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChatBox } from "./ChatBox";
import { MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="relative">
          <ChatBox className="shadow-2xl border-2" />
          <Button
            variant="ghost"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background border shadow-sm"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}