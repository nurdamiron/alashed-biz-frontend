export type WebSocketEventType =
  | 'connected'
  | 'new_order'
  | 'new_task'
  | 'task_completed'
  | 'task_assigned'
  | 'low_stock'
  | 'out_of_stock'
  | 'new_notification'
  | 'task_overdue'
  | 'order_status_changed'
  | 'order_completed'
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
  private maxReconnectAttempts = 10; // Increased from 5
  private reconnectDelay = 1000;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private listeners: Map<WebSocketEventType | '*', Set<EventCallback>> = new Map();
  private url: string = '';
  private visibilityHandler: (() => void) | null = null;
  private connectionStableTimeout: ReturnType<typeof setTimeout> | null = null;

  // Get fresh token from localStorage
  private getFreshToken(): string | null {
    return localStorage.getItem('alash_token');
  }

  connect(token?: string): void {
    if (this.socket?.readyState === WS_OPEN) {
      return;
    }

    // Use provided token or get from localStorage
    const actualToken = token || this.getFreshToken();
    if (!actualToken) {
      console.log('[WebSocket] No token available, skipping connection');
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = import.meta.env.VITE_API_URL?.replace(/^https?:\/\//, '').replace(/\/api\/?$/, '') || window.location.host;
    this.url = `${protocol}//${host}/ws?token=${encodeURIComponent(actualToken)}`;

    this.initializeConnection();
    this.setupVisibilityHandler();
  }

  private setupVisibilityHandler(): void {
    // Remove old handler if exists
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
    }

    // Create new handler for visibility change
    this.visibilityHandler = () => {
      if (document.visibilityState === 'visible') {
        // User returned to the tab, check connection and reconnect if needed
        if (this.socket?.readyState !== WS_OPEN) {
          console.log('[WebSocket] Tab became visible, reconnecting...');
          this.reconnectAttempts = 0; // Reset attempts on visibility change
          this.reconnectWithFreshToken();
        }
      }
    };

    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  // Reconnect with fresh token from localStorage
  private reconnectWithFreshToken(): void {
    const freshToken = this.getFreshToken();
    if (!freshToken) {
      console.log('[WebSocket] No token for reconnection');
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = import.meta.env.VITE_API_URL?.replace(/^https?:\/\//, '').replace(/\/api\/?$/, '') || window.location.host;
    this.url = `${protocol}//${host}/ws?token=${encodeURIComponent(freshToken)}`;

    this.initializeConnection();
  }

  private initializeConnection(): void {
    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        console.log('[WebSocket] Connected');
        this.reconnectAttempts = 0;
        this.startPingInterval();

        // Mark connection as stable after 30 seconds
        this.connectionStableTimeout = setTimeout(() => {
          console.log('[WebSocket] Connection stable');
        }, 30000);
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

        // Clear stable timeout
        if (this.connectionStableTimeout) {
          clearTimeout(this.connectionStableTimeout);
          this.connectionStableTimeout = null;
        }

        // Attempt reconnection if not intentionally closed and we have a token
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts && this.getFreshToken()) {
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
    // Exponential backoff with max of 30 seconds
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);
    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      // Always get fresh token on reconnect
      this.reconnectWithFreshToken();
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

    // Clear stable timeout
    if (this.connectionStableTimeout) {
      clearTimeout(this.connectionStableTimeout);
      this.connectionStableTimeout = null;
    }

    // Remove visibility handler
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = null;
    }

    if (this.socket) {
      this.socket.close(1000, 'Client disconnect');
      this.socket = null;
    }
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

  // Force reconnect with new token (call after token refresh)
  forceReconnect(): void {
    console.log('[WebSocket] Force reconnecting with new token...');

    // Close existing connection
    this.stopPingInterval();
    if (this.connectionStableTimeout) {
      clearTimeout(this.connectionStableTimeout);
      this.connectionStableTimeout = null;
    }
    if (this.socket) {
      this.socket.close(1000, 'Token refresh');
      this.socket = null;
    }

    // Reset attempts and reconnect
    this.reconnectAttempts = 0;
    this.reconnectWithFreshToken();
  }
}

// Singleton instance
export const wsClient = new WebSocketClient();
