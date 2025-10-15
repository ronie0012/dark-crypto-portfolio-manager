import { NextRequest, NextResponse } from "next/server";

// In-memory storage for demo purposes
// In production, you'd use a database like PostgreSQL, MongoDB, etc.
let messages: Array<{
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: number;
  avatar?: string;
}> = [
  {
    id: "demo-1",
    userId: "demo-user-1",
    username: "CryptoTrader",
    message: "Bitcoin looking strong today! 📈",
    timestamp: Date.now() - 3600000, // 1 hour ago
  },
  {
    id: "demo-2",
    userId: "demo-user-2", 
    username: "AltcoinExpert",
    message: "Anyone watching ETH? Seems like it's consolidating before a breakout",
    timestamp: Date.now() - 3000000, // 50 minutes ago
  },
  {
    id: "demo-3",
    userId: "demo-user-3",
    username: "HODLer2021",
    message: "DCA strategy has been working great this year. Patience pays off! 💎🙌",
    timestamp: Date.now() - 2400000, // 40 minutes ago
  },
  {
    id: "demo-4",
    userId: "demo-user-4",
    username: "TechnicalAnalyst",
    message: "RSI showing oversold conditions on several alts. Could be a good entry point",
    timestamp: Date.now() - 1800000, // 30 minutes ago
  },
  {
    id: "demo-5",
    userId: "demo-user-5",
    username: "DegenTrader",
    message: "Just took profits on my SOL position. Sometimes you gotta secure the bag! 💰",
    timestamp: Date.now() - 1200000, // 20 minutes ago
  },
  {
    id: "demo-6",
    userId: "demo-user-6",
    username: "BlockchainDev",
    message: "The fundamentals are getting stronger every day. Web3 adoption is accelerating 🚀",
    timestamp: Date.now() - 600000, // 10 minutes ago
  }
];



// GET - Fetch recent messages
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const userId = url.searchParams.get("userId");
    
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Return recent messages
    const recentMessages = messages
      .slice(-limit)
      .map(msg => ({
        ...msg,
        isOwn: msg.userId === userId
      }));

    return NextResponse.json({ messages: recentMessages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

// POST - Send a new message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, username, message } = body;

    if (!userId || !username || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newMessage = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      userId,
      username,
      message: message.trim(),
      timestamp: Date.now(),
    };

    // Add message to storage
    messages.push(newMessage);

    // Keep only last 1000 messages to prevent memory issues
    if (messages.length > 1000) {
      messages = messages.slice(-1000);
    }

    // Broadcast to all connected clients
    broadcastMessage(newMessage);

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

// Import broadcast functions from SSE route
async function broadcastMessage(message: any) {
  try {
    // Call the SSE broadcast function
    const sseModule = await import('./sse/route');
    sseModule.broadcastMessage(message);
  } catch (error) {
    console.error("Error broadcasting message:", error);
  }
}