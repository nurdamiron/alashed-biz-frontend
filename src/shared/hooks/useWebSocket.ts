import { useEffect, useCallback, useState } from 'react';
import { wsClient, WebSocketEvent, WebSocketEventType } from '../lib/websocket';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(wsClient.isConnected());

  useEffect(() => {
    const unsubscribe = wsClient.on('connected', () => {
      setIsConnected(true);
    });

    // Check connection state periodically
    const interval = setInterval(() => {
      setIsConnected(wsClient.isConnected());
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const connect = useCallback((token: string) => {
    wsClient.connect(token);
  }, []);

  const disconnect = useCallback(() => {
    wsClient.disconnect();
    setIsConnected(false);
  }, []);

  const subscribe = useCallback((event: WebSocketEventType | '*', callback: (data: WebSocketEvent) => void) => {
    return wsClient.on(event, callback);
  }, []);

  const send = useCallback((data: object) => {
    wsClient.send(data);
  }, []);

  return {
    isConnected,
    connect,
    disconnect,
    subscribe,
    send,
  };
}

// Hook for subscribing to specific events
export function useWebSocketEvent(
  event: WebSocketEventType | '*',
  callback: (data: WebSocketEvent) => void,
  deps: React.DependencyList = []
) {
  useEffect(() => {
    const unsubscribe = wsClient.on(event, callback);
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, ...deps]);
}
