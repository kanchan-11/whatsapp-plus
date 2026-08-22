import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Map());
  const stompClientRef = useRef(null);
  const subscriptionsMapRef = useRef(new Map()); // id -> { destination, callback, stompSub }

  useEffect(() => {
    if (!isAuthenticated || !token || !user) {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    const isHttps = window.location.protocol === 'https:';
    const wsProtocol = isHttps ? 'wss:' : 'ws:';
    const brokerURL = `${wsProtocol}//${window.location.host}/ws`;

    const client = new Client({
      brokerURL: brokerURL,
      // Fallback to SockJS if pure WebSocket connection fails
      webSocketFactory: () => new SockJS(`${window.location.protocol}//${window.location.host}/ws`),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: () => {},
      reconnectDelay: 4000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      setIsConnected(true);

      // Announce current user is online
      try {
        client.publish({
          destination: '/app/user.presence',
          body: JSON.stringify({
            userId: user.id,
            username: user.username,
            isOnline: true,
          }),
        });
      } catch (e) {
        console.warn('Presence broadcast failed', e);
      }

      // Subscribe to global presence channel
      try {
        client.subscribe('/topic/presence', (message) => {
          try {
            const presence = JSON.parse(message.body);
            setOnlineUsers((prev) => {
              const next = new Map(prev);
              next.set(presence.userId, {
                isOnline: presence.isOnline,
                lastSeen: presence.lastSeen,
              });
              return next;
            });
          } catch (e) {
            console.error('Error parsing presence update', e);
          }
        });
      } catch (e) {
        console.error('Failed to subscribe to /topic/presence', e);
      }

      // Resubscribe any registered active dynamic subscriptions
      subscriptionsMapRef.current.forEach((subObj, id) => {
        try {
          if (client.connected) {
            subObj.stompSub = client.subscribe(subObj.destination, subObj.callback);
          }
        } catch (err) {
          console.error(`Failed to bind subscription for ${subObj.destination}`, err);
        }
      });
    };

    client.onDisconnect = () => {
      setIsConnected(false);
    };

    client.onStompError = (frame) => {
      console.warn('STOMP Broker error', frame.headers['message']);
    };

    client.onWebSocketError = (event) => {
      // Handled silently by stompjs reconnect
    };

    client.activate();
    stompClientRef.current = client;

    const handleBeforeUnload = () => {
      if (client && client.connected && user) {
        try {
          client.publish({
            destination: '/app/user.presence',
            body: JSON.stringify({
              userId: user.id,
              username: user.username,
              isOnline: false,
            }),
          });
        } catch {}
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      handleBeforeUnload();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      client.deactivate();
      stompClientRef.current = null;
      setIsConnected(false);
    };
  }, [isAuthenticated, token, user?.id]);

  // Safe subscribe helper that only executes when connected, or re-attaches on reconnect
  const subscribe = useCallback((destination, callback) => {
    const subId = `${destination}_${Date.now()}_${Math.random()}`;
    const subObj = {
      destination,
      callback,
      stompSub: null,
    };

    if (stompClientRef.current && stompClientRef.current.connected) {
      try {
        subObj.stompSub = stompClientRef.current.subscribe(destination, callback);
      } catch (err) {
        console.error(`Failed to subscribe immediately to ${destination}`, err);
      }
    }

    subscriptionsMapRef.current.set(subId, subObj);

    return {
      unsubscribe: () => {
        const existing = subscriptionsMapRef.current.get(subId);
        if (existing) {
          if (existing.stompSub) {
            try {
              existing.stompSub.unsubscribe();
            } catch {}
          }
          subscriptionsMapRef.current.delete(subId);
        }
      },
    };
  }, []);

  const sendTyping = useCallback((chatId, isTyping) => {
    if (stompClientRef.current && stompClientRef.current.connected && user) {
      try {
        stompClientRef.current.publish({
          destination: '/app/chat.typing',
          body: JSON.stringify({
            chatId,
            userId: user.id,
            username: user.username,
            displayName: user.displayName || user.username,
            typing: isTyping,
          }),
        });
      } catch (err) {
        console.warn('Failed to send typing status', err);
      }
    }
  }, [user]);

  const sendSignal = useCallback((signalPayload) => {
    if (stompClientRef.current && stompClientRef.current.connected) {
      try {
        stompClientRef.current.publish({
          destination: '/app/call.signal',
          body: JSON.stringify(signalPayload),
        });
      } catch (err) {
        console.warn('Failed to send call signal', err);
      }
    }
  }, []);

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        onlineUsers,
        stompClient: stompClientRef.current,
        subscribe,
        sendTyping,
        sendSignal,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
