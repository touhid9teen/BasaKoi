"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Property } from "@/types";

export interface RealtimeMessage {
  type: "property-created" | "property-updated" | "property-deleted" | "connected";
  property?: Property;
  propertyId?: string;
  clientCount?: number;
}

type RealtimeHandler = (msg: RealtimeMessage) => void;

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001";

/**
 * useRealtime — connects to the BasaKoi WebSocket server and
 * fires callbacks when properties are created, updated, or deleted.
 *
 * Automatically reconnects on disconnect. Singleton connection
 * shared across all instances via a module-level ref.
 */
let sharedWs: WebSocket | null = null;
let sharedListeners = new Set<RealtimeHandler>();
let sharedReconnectTimer: ReturnType<typeof setTimeout> | null = null;

function getWsUrl(): string {
  // In browser, use the host's WS port
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    return `ws://${host}:3001`;
  }
  return WS_URL;
}

function connectShared() {
  if (sharedWs?.readyState === WebSocket.OPEN || sharedWs?.readyState === WebSocket.CONNECTING) {
    return;
  }

  const url = getWsUrl();

  try {
    sharedWs = new WebSocket(url);

    sharedWs.onopen = () => {
      console.log("[Realtime] Connected to WS server");
      if (sharedReconnectTimer) {
        clearTimeout(sharedReconnectTimer);
        sharedReconnectTimer = null;
      }
    };

    sharedWs.onmessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data) as RealtimeMessage;
        sharedListeners.forEach((fn) => fn(msg));
      } catch {
        // Ignore parse errors
      }
    };

    sharedWs.onclose = () => {
      console.log("[Realtime] Disconnected, reconnecting in 3s...");
      sharedWs = null;
      sharedReconnectTimer = setTimeout(() => connectShared(), 3000);
    };

    sharedWs.onerror = () => {
      sharedWs?.close();
    };
  } catch {
    // Connection failed, retry
    sharedReconnectTimer = setTimeout(() => connectShared(), 3000);
  }
}

/**
 * Hook that subscribes to real-time property updates.
 * Returns the latest realtime message (for UI indicators).
 */
export function useRealtime(onEvent?: RealtimeHandler): {
  lastEvent: RealtimeMessage | null;
  connected: boolean;
} {
  const [lastEvent, setLastEvent] = useState<RealtimeMessage | null>(null);
  const [connected, setConnected] = useState(false);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    // Connect on mount
    connectShared();

    const handler: RealtimeHandler = (msg) => {
      setLastEvent(msg);
      if (msg.type === "connected") {
        setConnected(true);
      }
      onEventRef.current?.(msg);
    };

    sharedListeners.add(handler);

    return () => {
      sharedListeners.delete(handler);
    };
  }, []);

  return { lastEvent, connected };
}

/**
 * Broadcast a property change to the WebSocket server.
 * Called from API routes or client-side after mutation.
 */
export async function broadcastChange(msg: RealtimeMessage): Promise<void> {
  try {
    await fetch(`http://${typeof window !== "undefined" ? window.location.hostname : "localhost"}:3001/broadcast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(msg),
    });
  } catch (err) {
    console.error("[Realtime] Broadcast failed:", err);
  }
}
