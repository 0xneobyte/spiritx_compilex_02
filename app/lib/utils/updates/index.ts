// Map to store all active connections and their associated send methods
export const clients = new Map();

// Function to send updates to all connected clients
export const sendUpdateToClients = (updateType: string, data: unknown) => {
  clients.forEach((client) => {
    client.send(`data: ${JSON.stringify({ type: updateType, data })}\n\n`);
  });
};

// Helper function to send updates to specific users
export const sendUpdateToUser = (
  userId: string,
  updateType: string,
  data: unknown
) => {
  clients.forEach((client, clientId) => {
    if (clientId.startsWith(userId)) {
      client.send(`data: ${JSON.stringify({ type: updateType, data })}\n\n`);
    }
  });
};
