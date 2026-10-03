import { WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';

export type WsMessageType = 
  | 'AMR_TELEMETRY'
  | 'TASK_UPDATE'
  | 'COORDINATION_UPDATE'
  | 'WAREHOUSE_OBSTACLE'
  | 'EDGE_PERCEPTION'
  | 'SIMULATION_EVENT'
  | 'OPERATIONAL_ALERT'
  | 'ALERT_UPDATE'
  | 'SYSTEM_HEARTBEAT';

export interface WsMessagePayload<T = any> {
  type: WsMessageType;
  timestamp: string;
  data: T;
}

export class WebSocketService {
  private static instance: WebSocketService;
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();

  private constructor() {}

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public init(server: HttpServer) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket, req) => {
      const clientIp = req.socket.remoteAddress || 'unknown';
      this.clients.add(ws);
      console.log(`[WebSocket] Client connected from ${clientIp}. Total connected clients: ${this.clients.size}`);

      // Send initial welcome message
      ws.send(JSON.stringify({
        type: 'SYSTEM_HEARTBEAT',
        timestamp: new Date().toISOString(),
        data: {
          status: 'connected',
          server: 'NEXUS AMR OS Fleet Telemetry Core',
          version: '4.0.0',
          activeClients: this.clients.size
        }
      }));

      ws.on('message', (message: string) => {
        try {
          const parsed = JSON.parse(message.toString());
          if (parsed.type === 'PING') {
            ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
          }
        } catch {
          // Ignore malformed messages
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
        console.log(`[WebSocket] Client disconnected. Remaining clients: ${this.clients.size}`);
      });

      ws.on('error', (err) => {
        console.warn('[WebSocket] Connection error:', err);
        this.clients.delete(ws);
      });
    });
  }

  public broadcast<T>(type: WsMessageType, data: T) {
    if (this.clients.size === 0) return;

    const payload: WsMessagePayload<T> = {
      type,
      timestamp: new Date().toISOString(),
      data
    };

    const messageString = JSON.stringify(payload);

    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageString);
      }
    });
  }

  public getConnectedClientsCount(): number {
    return this.clients.size;
  }
}

export const wsService = WebSocketService.getInstance();
