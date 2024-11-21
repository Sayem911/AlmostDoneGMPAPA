'use client';

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSocket } from '@/hooks/use-socket';

export function WebSocketHandler() {
  const socket = useSocket();
  const { toast } = useToast();

  useEffect(() => {
    if (!socket) return;

    const handleError = (error: Error) => {
      console.error('WebSocket error:', error);
      toast({
        title: 'Connection Error',
        description: 'Lost connection to server. Retrying...',
        variant: 'destructive',
      });
    };

    const handleReconnect = (attempt: number) => {
      toast({
        title: 'Reconnected',
        description: 'Connection restored successfully',
      });
    };

    socket.on('connect_error', handleError);
    socket.on('reconnect', handleReconnect);

    return () => {
      socket.off('connect_error', handleError);
      socket.off('reconnect', handleReconnect);
    };
  }, [socket, toast]);

  return null;
}