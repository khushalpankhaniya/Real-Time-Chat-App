// ── ChatDashboard.jsx ─────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from 'react';

import Sidebar      from '../components/sidebar/Sidebar';
import ChatHeader   from '../components/chat/ChatHeader';
import MessageList  from '../components/chat/MessageList';
import MessageInput from '../components/chat/MessageInput';

import { useSocket } from '../hooks/useSocket';
import {
  fetchConversations,
  fetchAllUsers,
  createConversation,
  fetchConversationMessages,
  fetchUserPubKey,
  searchUsers,
  saveUserProfile,
} from '../lib/api';


export default function ChatDashboard({ profile }) {
  // profile._id is the MongoDB ObjectId string for the user document
  const myId = profile._id;

  // ── State ─────────────────────────────────────────────────────────────
  const [conversations,  setConversations]  = useState([]);   // from GET /api/conversations
  const [onlineUsers,    setOnlineUsers]    = useState(new Set());
  const [activeConv,     setActiveConv]     = useState(null); // { _id, otherUser, ... }
  const [roomMessages,   setRoomMessages]   = useState({});   // roomId → msg[]
  const [inputMessage,   setInputMessage]   = useState('');
  const [typingUsers,    setTypingUsers]    = useState({});   // roomId → bool
  const [searchQuery,    setSearchQuery]    = useState('');
  const [searchResults,  setSearchResults]  = useState([]);
  const [isSearching,    setIsSearching]    = useState(false);
  const [allUsers,       setAllUsers]       = useState([]);
  const [isLoadingAllUsers, setIsLoadingAllUsers] = useState(false);

  // ── Refs to avoid stale closures in socket callbacks ──────────────────
  const activeConvRef   = useRef(null);
  const loadedRoomsRef  = useRef(new Set());

  activeConvRef.current = activeConv;



  // ── Load conversations on mount ───────────────────────────────────────

  useEffect(() => {
    fetchConversations(myId)
      .then(({ data }) => setConversations(data))
      .catch((err) => console.error('Failed to load conversations:', err));
  }, [myId]);

  // ── Load all users on mount ───────────────────────────────────────────

  useEffect(() => {
    setIsLoadingAllUsers(true);
    fetchAllUsers()
      .then(({ data }) => {
        const filtered = data.filter((u) => u._id !== myId);
        setAllUsers(filtered);
      })
      .catch((err) => console.error('Failed to load users:', err))
      .finally(() => setIsLoadingAllUsers(false));
  }, [myId]);



  // ── Search ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data } = await searchUsers(searchQuery.trim(), myId);
        setSearchResults(data);
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300); // debounce 300 ms

    return () => clearTimeout(timer);
  }, [searchQuery, myId]);

  // ── Socket handlers ───────────────────────────────────────────────────

  const handleIncoming = useCallback((msg) => {
    const conv = activeConvRef.current;

    const contactName = conv?.otherUser?.displayName || conv?.otherUser?.username || msg.senderName;
    const shaped = {
      _id:        msg._id,
      tempId:     msg.tempId,
      roomId:     msg.roomId,
      senderId:   msg.senderId,
      text:       msg.ciphertext,
      isSent:     msg.senderId === myId,
      senderName: msg.senderId === myId ? 'You' : contactName,
      time:       new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setRoomMessages((prev) => {
      const room    = prev[msg.roomId] || [];
      // If the message has an ID, and we already have a message with that ID, it's a duplicate.
      const hasIdMatch = msg._id && room.some((m) => m._id === msg._id);
      if (hasIdMatch) return prev;

      // Replace optimistic bubble by tempId, otherwise append
      const exists  = msg.tempId && room.some((m) => m.tempId === msg.tempId);
      const updated = exists
        ? room.map((m) => (m.tempId === msg.tempId ? shaped : m))
        : [...room, shaped];
      return { ...prev, [msg.roomId]: updated };
    });

    // Update conversation list last-message preview
    setConversations((prev) =>
      prev.map((c) =>
        c._id?.toString() === msg.roomId
          ? { ...c, lastMessage: { ciphertext: msg.ciphertext, sentAt: msg.sentAt } }
          : c
      )
    );
  }, [myId]);

  const handleUserOnline = useCallback(({ userId }) => {
    setOnlineUsers((prev) => {
      const next = new Set(prev);
      next.add(userId);
      return next;
    });

    // Fetch user profiles again if a new user joins who is not yet in our allUsers state
    if (userId !== myId) {
      setAllUsers((prevUsers) => {
        const exists = prevUsers.some((u) => u._id === userId);
        if (!exists) {
          fetchAllUsers()
            .then(({ data }) => {
              const filtered = data.filter((u) => u._id !== myId);
              setAllUsers(filtered);
            })
            .catch((err) => console.error('Failed to update users list on user join:', err));
        }
        return prevUsers;
      });
    }
  }, [myId]);

  const handleUserOffline = useCallback(({ userId }) => {
    setOnlineUsers((prev) => {
      const next = new Set(prev);
      next.delete(userId);
      return next;
    });
  }, []);

  const handleTyping = useCallback(({ roomId, userId, isTyping }) => {
    // Only show for messages NOT sent by us
    if (userId === myId) return;
    setTypingUsers((prev) => ({ ...prev, [roomId]: isTyping ? userId : null }));
  }, [myId]);

  const socket = useSocket({
    userId:        myId,
    onMessage:     handleIncoming,
    onUserOnline:  handleUserOnline,
    onUserOffline: handleUserOffline,
    onTyping:      handleTyping,
  });

  // ── Open a conversation from the conversation list ────────────────────

  const openConversation = useCallback(async (conv) => {
    const roomId    = conv._id.toString();

    // Leave current room first
    if (activeConvRef.current) {
      socket.leaveRoom(activeConvRef.current._id.toString());
    }

    setActiveConv(conv);
    setInputMessage('');
    socket.joinRoom(roomId);

    // Load history once per session
    if (loadedRoomsRef.current.has(roomId)) return;
    loadedRoomsRef.current.add(roomId);

    try {
      const { data } = await fetchConversationMessages(conv._id);
      const shaped = data.map((m) => ({
        ...m,
        text:       m.ciphertext,
        isSent:     m.senderId === myId,
        senderName: m.senderId === myId ? 'You' : conv.otherUser?.displayName || conv.otherUser?.username,
        time:       new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));

      setRoomMessages((prev) => ({ ...prev, [roomId]: shaped }));
    } catch (err) {
      console.error('Failed to load conversation history:', err);
      setRoomMessages((prev) => ({ ...prev, [roomId]: [] }));
    }
  }, [myId, socket]);

  // ── Select a user from search results ────────────────────────────────

  const handleSelectContact = useCallback(async (user) => {
    // Clear search so the sidebar reverts to conversation list
    setSearchQuery('');
    setSearchResults([]);

    try {
      const { data: conv } = await createConversation(myId, user._id);

      // The POST returns the Mongoose document; normalise to the same shape
      // as conversations from GET (which have otherUser pre-computed).
      const otherUser =
        conv.participant1?._id === myId ? conv.participant2 : conv.participant1;

      const normalised = {
        _id:         conv._id,
        otherUser:   otherUser || user,
        lastMessage: null,
        updatedAt:   conv.updatedAt,
      };

      // Add to conversations list if not already present
      setConversations((prev) => {
        const exists = prev.some((c) => c._id?.toString() === conv._id?.toString());
        return exists ? prev : [normalised, ...prev];
      });

      await openConversation(normalised);
    } catch (err) {
      console.error('Failed to create/open conversation:', err);
    }
  }, [myId, openConversation]);

  // ── Send a message ────────────────────────────────────────────────────

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeConv) return;
    if (!socket.isConnected()) {
      console.error('Socket not connected');
      return;
    }

    const roomId    = activeConv._id.toString();
    const plaintext = inputMessage.trim();
    setInputMessage('');

    const tempId = `tmp_${Date.now()}`;

    // Optimistic bubble
    setRoomMessages((prev) => ({
      ...prev,
      [roomId]: [
        ...(prev[roomId] || []),
        {
          tempId,
          roomId,
          senderId: myId,
          text:     plaintext,
          isSent:   true,
          time:     new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    }));

    socket.sendMessage({
      roomId,
      senderId:   myId,
      senderName: profile.displayName || profile.username || 'Anonymous',
      ciphertext: plaintext,
      nonce:      '',
      tempId,
      recipientId: activeConv.otherUser._id,
    });
  };

  // ── Typing passthrough ────────────────────────────────────────────────

  const handleTypingStart = () => {
    if (!activeConv) return;
    socket.startTyping(activeConv._id.toString(), myId);
  };

  const handleTypingStop = () => {
    if (!activeConv) return;
    socket.stopTyping(activeConv._id.toString(), myId);
  };

  // ── Derived values ────────────────────────────────────────────────────

  const activeRoomId    = activeConv?._id?.toString() ?? null;
  const activeMessages  = activeRoomId ? (roomMessages[activeRoomId] || []) : [];
  const isContactOnline = activeConv ? onlineUsers.has(activeConv.otherUser?._id) : false;
  const isTyping        = activeRoomId ? Boolean(typingUsers[activeRoomId]) : false;

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="h-screen bg-[#eae6df] flex items-center justify-center p-0 md:p-[19px] overflow-hidden font-sans">
      <div className="w-full h-full max-w-[1600px] bg-white shadow-xl flex rounded-none md:rounded-lg overflow-hidden border border-[#d1d7db]">

        <Sidebar
          profile={profile}
          conversations={conversations}
          searchResults={searchResults}
          onlineUsers={onlineUsers}
          activeId={activeRoomId}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isSearching={isSearching}
          onSelectContact={handleSelectContact}
          onSelectConv={openConversation}
          allUsers={allUsers}
          isLoadingAllUsers={isLoadingAllUsers}
        />

        <div className="flex-1 bg-[#efeae2] flex flex-col h-full relative">
          <div className="absolute inset-0 bg-[radial-gradient(#00a884_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-[0.03] pointer-events-none" />
          <ChatHeader
            contact={activeConv?.otherUser ?? null}
            isOnline={isContactOnline}
            isTyping={isTyping}
          />
          <MessageList messages={activeMessages} contact={activeConv?.otherUser ?? null} />
          {activeConv && (
            <MessageInput
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onSubmit={handleSendMessage}
              onTypingStart={handleTypingStart}
              onTypingStop={handleTypingStop}
            />
          )}
        </div>

      </div>
    </div>
  );
}
