// ── useSocket.js ──────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKETIO_SERVER_URL || 'http://localhost:5000';

/**
 * Manages a single Socket.IO connection for the session.
 *
 * @param {object} options
 * @param {string}   options.userId         - Clerk userId (sent in `join` event)
 * @param {function} options.onMessage      - Called with each `new_message` event
 * @param {function} options.onUserOnline   - Called with `{ userId }`
 * @param {function} options.onUserOffline  - Called with `{ userId, lastSeenAt }`
 * @param {function} options.onTyping       - Called with `{ roomId, userId, isTyping }`
 *
 * Returns an API object with helper methods.
 */
export function useSocket({ userId, onMessage, onUserOnline, onUserOffline, onTyping }) {
  const socketRef      = useRef(null);
  const currentRoomRef = useRef(null);

  // Keep callbacks in refs so the socket handler never goes stale
  const onMessageRef     = useRef(onMessage);
  const onUserOnlineRef  = useRef(onUserOnline);
  const onUserOfflineRef = useRef(onUserOffline);
  const onTypingRef      = useRef(onTyping);

  onMessageRef.current     = onMessage;
  onUserOnlineRef.current  = onUserOnline;
  onUserOfflineRef.current = onUserOffline;
  onTypingRef.current      = onTyping;

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 Socket connected:', socket.id);
      // Announce presence to server
      if (userId) socket.emit('join', { userId });
    });

    socket.on('new_message',  (msg)  => onMessageRef.current?.(msg));
    socket.on('user_online',  (data) => onUserOnlineRef.current?.(data));
    socket.on('user_offline', (data) => onUserOfflineRef.current?.(data));
    socket.on('typing',       (data) => onTypingRef.current?.(data));
    socket.on('error',        (err)  => console.error('Socket error:', err.message));
    socket.on('disconnect',   ()     => console.log('🔌 Socket disconnected'));

    return () => socket.disconnect();
  }, [userId]); // reconnect if userId changes (e.g. account switch)

  // ── Public API ────────────────────────────────────────────────────────

  const joinRoom = (roomId) => {
    if (!roomId || currentRoomRef.current === roomId) return;
    socketRef.current?.emit('join_room', roomId);
    currentRoomRef.current = roomId;
  };

  const leaveRoom = (roomId) => {
    socketRef.current?.emit('leave_room', roomId);
    if (currentRoomRef.current === roomId) currentRoomRef.current = null;
  };

  const sendMessage = (payload) => {
    socketRef.current?.emit('send_message', payload);
  };

  const startTyping = (roomId, uid) => {
    socketRef.current?.emit('typing_start', { roomId, userId: uid });
  };

  const stopTyping = (roomId, uid) => {
    socketRef.current?.emit('typing_stop', { roomId, userId: uid });
  };

  const isConnected = () => socketRef.current?.connected ?? false;

  return { joinRoom, leaveRoom, sendMessage, startTyping, stopTyping, isConnected };
}
