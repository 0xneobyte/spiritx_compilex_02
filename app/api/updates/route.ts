import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/utils/auth";

// Map to store all active connections and their associated send methods
const clients = new Map();

// Function to send updates to all connected clients
export const sendUpdateToClients = (updateType: string, data: any) => {
  clients.forEach((client) => {
    client.send(`data: ${JSON.stringify({ type: updateType, data })}\n\n`);
  });
};

export async function GET(req: NextRequest) {
  // Authenticate user
  const auth = authenticateRequest(req);
  if (!auth.authenticated || !auth.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Create a unique client ID
  const clientId = crypto.randomUUID();

  // Set up SSE headers
  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  // Send initial connection message
  writer.write(
    encoder.encode("event: connected\ndata: Connected to server\n\n")
  );

  // Store the client's send method
  clients.set(clientId, {
    send: (data: string) => {
      writer.write(encoder.encode(data));
    },
    userId: auth.user.id,
  });

  // Clean up on disconnect
  req.signal.addEventListener("abort", () => {
    clients.delete(clientId);
  });

  return new Response(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

// Helper function to send updates to specific users
export const sendUpdateToUser = (
  userId: string,
  updateType: string,
  data: any
) => {
  clients.forEach((client, clientId) => {
    if (client.userId === userId) {
      client.send(`data: ${JSON.stringify({ type: updateType, data })}\n\n`);
    }
  });
};
