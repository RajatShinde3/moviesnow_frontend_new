// hooks/useWebSocket.ts
import { useEffect, useRef, useCallback, useState } from 'react';
import { io } from 'socket.io-client';
type Socket = any;
import { WebSocketMessage } from '@/types/upload';

interface UseWebSocketOptions {
  url: string;
  token?: string;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export function useWebSocket({
  url,
  token,
  onMessage,
  onConnect,
  onDisconnect,
  onError
}: UseWebSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!url) return;

    // Create socket connection
    const socket = io(url, {
      auth: {
        token: token || ''
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);
      onConnect?.();
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      onDisconnect?.();
    });

    socket.on('error', (err: Error) => {
      setError(err);
      onError?.(err);
    });

    // Message handlers
    socket.on('upload:progress', (data: any) => {
      onMessage?.({ type: 'upload:progress', data });
    });

    socket.on('upload:completed', (data: any) => {
      onMessage?.({ type: 'upload:completed', data });
    });

    socket.on('upload:error', (data: any) => {
      onMessage?.({ type: 'upload:error', data });
    });

    socket.on('upload:paused', (data: any) => {
      onMessage?.({ type: 'upload:paused', data });
    });

    // Cleanup on unmount
    return () => {
      socket.close();
    };
  }, [url, token, onMessage, onConnect, onDisconnect, onError]);

  const sendMessage = useCallback((event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  const disconnect = useCallback(() => {
    socketRef.current?.close();
  }, []);

  return {
    isConnected,
    error,
    sendMessage,
    disconnect
  };
}
