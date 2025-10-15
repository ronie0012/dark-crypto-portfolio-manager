import { NextResponse } from "next/server";

// Simple test endpoint to verify API is working
export async function GET() {
  return NextResponse.json({
    status: "success",
    message: "Chat API is working!",
    timestamp: new Date().toISOString(),
    endpoints: {
      "GET /api/chat": "Fetch messages",
      "POST /api/chat": "Send message", 
      "GET /api/chat/sse": "Real-time connection",
      "POST /api/chat/seed": "Seed demo messages",
      "GET /api/chat/test": "This test endpoint"
    },
    server: {
      environment: process.env.NODE_ENV || "development",
      port: process.env.PORT || "3000"
    }
  });
}

export async function POST() {
  return NextResponse.json({
    status: "success",
    message: "POST request received successfully!",
    timestamp: new Date().toISOString(),
    note: "This endpoint accepts both GET and POST for testing purposes"
  });
}