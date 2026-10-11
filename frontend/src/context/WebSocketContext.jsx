import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import useAuth from '../hooks/useAuth';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const { token, isAuthenticated, user } = useAuth();
  const [connected, setConnected] = useState(false);
  const stompClientRef = useRef(null);
  const listenersRef = useRef(new Set());
  const readListenersRef = useRef(new Set());

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
        setConnected(false);
      }
      return;
    }

    const socketUrl = `${window.location.protocol === 'https:' ? 'https:' : 'http:'}//${window.location.host}/ws`;

    const client = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (str) => {
        // Uncomment for debug logs:
        // console.log('[STOMP]', str);
      },
      onConnect: () => {
        setConnected(true);

        // Subscribe to private queue messages
        client.subscribe('/user/queue/messages', (message) => {
          try {
            const payload = JSON.parse(message.body);
            listenersRef.current.forEach((listener) => listener(payload));
          } catch (err) {
            console.error('Failed to parse incoming WebSocket message', err);
          }
        });

        // Subscribe to read receipts
        client.subscribe('/user/queue/read-receipts', (receipt) => {
          try {
            const payload = JSON.parse(receipt.body);
            readListenersRef.current.forEach((listener) => listener(payload));
          } catch (err) {
            console.error('Failed to parse read receipt', err);
          }
        });
      },
      onDisconnect: () => {
        setConnected(false);
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      client.deactivate();
      stompClientRef.current = null;
      setConnected(false);
    };
  }, [isAuthenticated, token, user?.username]);

  const sendMessage = useCallback((recipientId, content) => {
    if (!content || !content.trim()) return false;

    const payload = {
      recipientId: Number(recipientId),
      content: content.trim(),
    };

    if (stompClientRef.current && stompClientRef.current.connected) {
      stompClientRef.current.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(payload),
      });
      return true;
    }
    return false;
  }, []);

  const addMessageListener = useCallback((callback) => {
    listenersRef.current.add(callback);
    return () => {
      listenersRef.current.delete(callback);
    };
  }, []);

  const addReadReceiptListener = useCallback((callback) => {
    readListenersRef.current.add(callback);
    return () => {
      readListenersRef.current.delete(callback);
    };
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        connected,
        sendMessage,
        addMessageListener,
        addReadReceiptListener,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export default useWebSocket;
