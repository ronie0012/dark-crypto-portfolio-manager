import { NextRequest } from "next/server";
import { sseClients, broadcastUserCount } from "@/lib/sse-utils";

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

