/**
 * BasaKoi WebSocket Server
 *
 * Runs alongside the Next.js dev server on port 3001.
 * API routes connect via HTTP POST to http://localhost:3001/broadcast
 * to push new/updated properties to all connected clients.
 *
 * Clients connect via WebSocket to ws://localhost:3001
 */

import http from "http";
import { WebSocketServer, WebSocket } from "ws";

const PORT = parseInt(process.env.WS_PORT || "3001", 10);

// Track all connected clients
const clients = new Set<WebSocket>();

// Create HTTP server to receive broadcasts from API routes
const httpServer = http.createServer(
  (req: http.IncomingMessage, res: http.ServerResponse) => {
    // CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.method === "POST" && req.url === "/broadcast") {
      let body = "";
      req.on("data", (chunk: string) => (body += chunk));
      req.on("end", () => {
        try {
          const message = JSON.parse(body);
          broadcast(message);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: true, sent: clients.size }));
        } catch {
          res.writeHead(400);
          res.end(JSON.stringify({ error: "Invalid JSON" }));
        }
      });
      return;
    }

    res.writeHead(404);
    res.end("Not found");
  }
);

// Create WebSocket server
const wss = new WebSocketServer({ server: httpServer });

wss.on("connection", (ws: WebSocket) => {
  clients.add(ws);
  console.log(`[WS] Client connected (${clients.size} total)`);

  ws.on("close", () => {
    clients.delete(ws);
    console.log(`[WS] Client disconnected (${clients.size} remaining)`);
  });

  ws.on("error", (err: Error) => {
    console.error("[WS] Client error:", err.message);
    clients.delete(ws);
  });

  // Send an initial heartbeat
  ws.send(JSON.stringify({ type: "connected", clientCount: clients.size }));
});

function broadcast(message: object): void {
  const data = JSON.stringify(message);
  let sent = 0;
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
      sent++;
    }
  });
  console.log(`[WS] Broadcast to ${sent} clients`);
}

httpServer.listen(PORT, () => {
  console.log(`[WS] BasaKoi WebSocket server running on ws://localhost:${PORT}`);
  console.log(`[WS] HTTP broadcast endpoint: http://localhost:${PORT}/broadcast`);
});
