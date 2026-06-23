import express    from 'express';
import http        from 'http';
import { Server }  from 'socket.io';
import morgan      from 'morgan';
import cors        from 'cors';
import dotenv      from 'dotenv';

import { connectDB }          from './config/db.js';
import userRoutes             from './routes/users.routes.js';
import messageRoutes          from './routes/messages.routes.js';
import conversationRoutes     from './routes/conversations.routes.js';
import keysRoutes             from './routes/keys.routes.js';
import { Message }            from './models/messages.js';
import { User }               from './models/users.js';

dotenv.config();

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

connectDB();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (_req, res) => res.json({ message: 'Real-time Chat Server is running' }));

app.use('/api/users',         userRoutes);
app.use('/api/messages',      messageRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/keys',          keysRoutes);

// ── Presence tracking ─────────────────────────────────────────────────────
// userId → socketId
const onlineUsers = new Map();

// ── Socket.io ─────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`🔌 connected: ${socket.id}`);

  // ── Presence: join ────────────────────────────────────────────────────
  /**
   * Client → Server: `join`
   * Payload: { userId }
   * Marks the user as online, tracks socket, broadcasts presence.
   */
  socket.on('join', async ({ userId } = {}) => {
    if (!userId) return;

    socket.userId = userId;
    onlineUsers.set(userId, socket.id);

    try {
      await User.findByIdAndUpdate(userId, {
        status:     'online',
        lastSeenAt: new Date(),
      });
    } catch (err) {
      console.error('Presence update error (join):', err.message);
    }

    // Broadcast to every OTHER connected socket
    socket.broadcast.emit('user_online', { userId });
  });

  // ── Room management ───────────────────────────────────────────────────
  /** Client calls this after connecting to subscribe to a DM or group room */
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`   ${socket.id} joined room: ${roomId}`);
  });

  socket.on('leave_room', (roomId) => {
    socket.leave(roomId);
  });

  // ── Typing indicators ─────────────────────────────────────────────────
  /**
   * Client → Server: `typing_start`
   * Payload: { roomId, userId }
   */
  socket.on('typing_start', ({ roomId, userId } = {}) => {
    if (!roomId || !userId) return;
    socket.to(roomId).emit('typing', { roomId, userId, isTyping: true });
  });

  /**
   * Client → Server: `typing_stop`
   * Payload: { roomId, userId }
   */
  socket.on('typing_stop', ({ roomId, userId } = {}) => {
    if (!roomId || !userId) return;
    socket.to(roomId).emit('typing', { roomId, userId, isTyping: false });
  });

  // ── Messaging ─────────────────────────────────────────────────────────
  /**
   * Incoming message payload:
   * { roomId, senderId, senderName, ciphertext, nonce, tempId }
   *
   * ciphertext + nonce are persisted. tempId is echoed back so
   * the sender can swap the optimistic bubble for the confirmed one.
   * nonce is optional — client may embed IV in the ciphertext blob.
   */
  socket.on('send_message', async (data) => {
    const { roomId, senderId, senderName, ciphertext, nonce = '', tempId, recipientId } = data;

    if (!roomId || !senderId || !ciphertext) {
      socket.emit('error', { message: 'Invalid message payload' });
      return;
    }

    try {
      const saved = await Message.create({ roomId, senderId, ciphertext, nonce });

      const outgoing = {
        _id:        saved._id,
        tempId,
        roomId,
        senderId,
        senderName,
        ciphertext,
        nonce,
        sentAt:     saved.sentAt,
      };

      // Deliver to everyone in the room (including sender — confirms delivery)
      io.to(roomId).emit('new_message', outgoing);

      // ALSO deliver to the recipient directly if they are online but not in the room
      if (recipientId && onlineUsers.has(recipientId)) {
        const recipientSocketId = onlineUsers.get(recipientId);
        io.to(recipientSocketId).emit('new_message', outgoing);
      }
    } catch (err) {
      console.error('Message save error:', err.message);
      socket.emit('error', { message: 'Failed to save message' });
    }
  });

  // ── Disconnect / presence cleanup ─────────────────────────────────────
  socket.on('disconnect', async () => {
    console.log(`🔌 disconnected: ${socket.id}`);

    const userId = socket.userId;
    if (!userId) return;

    onlineUsers.delete(userId);

    const lastSeenAt = new Date();
    try {
      await User.findByIdAndUpdate(userId, {
        status: 'offline',
        lastSeenAt,
      });
    } catch (err) {
      console.error('Presence update error (disconnect):', err.message);
    }

    // Broadcast offline status to all connected clients
    io.emit('user_offline', { userId, lastSeenAt });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
