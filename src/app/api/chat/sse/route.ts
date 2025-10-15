import { NextRequest } from "next/server";

// Simple in-memory storage for SSE clients
const sseClients = new Map<string, {
  id: string;
  userId: string;
  username: string;
  controller: ReadableStreamDefaultController;
  lastSeen: number;
}>();

// Server-Sent Events endpoint for real-time updates
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  const username = url.searchParams.get("username");

  if (!userId || !username) {
    return new Response("User ID and username required", { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Add client to active connections
      const clientId = `${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const client = {
        id: clientId,
        userId,
        username,
        controller,
        lastSeen: Date.now()
      };
      
      sseClients.set(clientId, client);
      console.log(`SSE client connected: ${clientId}, total clients: ${sseClients.size}`);

      // Send initial connection message
      try {
        const connectMsg = `data: ${JSON.stringify({ type: 'connected', data: { clientId } })}\n\n`;
        controller.enqueue(encoder.encode(connectMsg));
      } catch (error) {
        console.error("Error sending initial message:", error);
      }

      // Send user count update
      broadcastUserCount();

      // Keep connection alive with heartbeat
      const heartbeat = setInterval(() => {
        try {
          const heartbeatMsg = `data: ${JSON.stringify({ type: 'heartbeat', data: { timestamp: Date.now() } })}\n\n`;
          controller.enqueue(encoder.encode(heartbeatMsg));
        } catch (error) {
          console.error("Heartbeat error:", error);
          clearInterval(heartbeat);
          cleanup();
        }
      }, 30000); // 30 seconds

      // Cleanup function
      const cleanup = () => {
        clearInterval(heartbeat);
        sseClients.delete(clientId);
        console.log(`SSE client disconnected: ${clientId}, remaining clients: ${sseClients.size}`);
        broadcastUserCount();
        try {
          controller.close();
        } catch (error) {
          // Connection already closed
        }
      };

      // Handle client disconnect
      request.signal.addEventListener('abort', cleanup);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}

// Export broadcast functions for use by other routes
export function broadcastMessage(message: any) {
  const encoder = new TextEncoder();
  const messageData = `data: ${JSON.stringify({ type: 'message', data: message })}\n\n`;
  
  // Remove disconnected clients and broadcast to active ones
  const disconnectedClients: string[] = [];
  
  sseClients.forEach((client, clientId) => {
    try {
      client.controller.enqueue(encoder.encode(messageData));
    } catch (error) {
      console.error(`Error broadcasting to client ${clientId}:`, error);
      disconnectedClients.push(clientId);
    }
  });
  
  // Remove disconnected clients
  disconnectedClients.forEach(clientId => {
    sseClients.delete(clientId);
  });
  
  console.log(`Broadcasted message to ${sseClients.size} clients`);
}

export function broadcastUserCount() {
  const encoder = new TextEncoder();
  const activeUsers = sseClients.size;
  const userCountMessage = {
    type: 'userCount',
    data: { count: activeUsers }
  };
  
  const messageData = `data: ${JSON.stringify(userCountMessage)}\n\n`;
  
  sseClients.forEach((client, clientId) => {
    try {
      client.controller.enqueue(encoder.encode(messageData));
    } catch (error) {
      console.error(`Error sending user count to client ${clientId}:`, error);
    }
  });
}