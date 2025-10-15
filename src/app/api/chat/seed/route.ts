import { NextResponse } from "next/server";

// Demo messages for testing
const demoMessages = [
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

export async function POST() {
  try {
    // This would normally interact with your database
    // For demo purposes, we'll just return success
    
    return NextResponse.json({ 
      success: true, 
      message: "Demo messages seeded successfully",
      count: demoMessages.length 
    });
  } catch (error) {
    console.error("Error seeding demo messages:", error);
    return NextResponse.json({ error: "Failed to seed demo messages" }, { status: 500 });
  }
}