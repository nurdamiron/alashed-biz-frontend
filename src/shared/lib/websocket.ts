export type WebSocketEventType =
  | 'connected'
  | 'new_order'
  | 'new_task'
  | 'low_stock'
  | 'out_of_stock'
  | 'new_notification'
  | 'task_overdue'
  | 'order_status_changed'
  | 'pong';

export interface WebSocketEvent {
  type: WebSocketEventType;
  data: any;
  timestamp: string;
}

type EventCallback = (event: WebSocketEvent) => void;

// WebSocket ready state constants
const WS_OPEN = 1;
const WS_CLOSED = 3;

class WebSocketClient {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private listeners: Map<WebSocketEventType | '*', Set<EventCallback>> = new Map();
  private url: string = '';
  private token: string = '';

  connect(token: string): void {
    if (this.socket?.readyState === WS_OPEN) {
      return;
    }

    this.token = token;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = import.meta.env.VITE_API_URL?.replace(/^https?:\/\//, '').replace(/\/api\/?$/, '') || window.location.host;
    this.url = `${protocol}//${host}/ws?token=${encodeURIComponent(token)}`;

    this.initializeConnection();
  }

  private initializeConnection(): void {
    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        console.log('[WebSocket] Connected');
        this.reconnectAttempts = 0;
        this.startPingInterval();
      };

      this.socket.onmessage = (event) => {
        try {
          const data: WebSocketEvent = JSON.parse(event.data);
          this.emit(data.type, data);
          this.emit('*', data); // Wildcard listeners
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error);
        }
      };

      this.socket.onclose = (event) => {
        console.log('[WebSocket] Disconnected:', event.code, event.reason);
        this.stopPingInterval();

        // Attempt reconnection if not intentionally closed
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.socket.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
      };
    } catch (error) {
      console.error('[WebSocket] Connection error:', error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      if (this.token) {
        this.initializeConnection();
      }
    }, delay);
  }

  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      this.send({ type: 'ping' });
    }, 25000); // Ping every 25 seconds (slightly less than server's 30s timeout)
  }

  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  send(data: object): void {
    if (this.socket?.readyState === WS_OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }

  disconnect(): void {
    this.stopPingInterval();
    if (this.socket) {
      this.socket.close(1000, 'Client disconnect');
      this.socket = null;
    }
    this.token = '';
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent auto-reconnect
  }

  on(event: WebSocketEventType | '*', callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  off(event: WebSocketEventType | '*', callback: EventCallback): void {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: WebSocketEventType | '*', data: WebSocketEvent): void {
    this.listeners.get(event)?.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error('[WebSocket] Listener error:', error);
      }
    });
  }

  isConnected(): boolean {
    return this.socket?.readyState === WS_OPEN;
  }

  getState(): number {
    return this.socket?.readyState ?? WS_CLOSED;
  }
}

// Singleton instance
export const wsClient = new WebSocketClient();
