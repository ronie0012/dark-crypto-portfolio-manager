// SSE utility functions for broadcasting messages

// Simple in-memory storage for SSE clients
export const sseClients = new Map<string, {
  id: string;
  userId: string;
  username: string;
  controller: ReadableStreamDefaultController;
  lastSeen: number;
}>();

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