// ── ContactList.jsx ───────────────────────────────────────────────────────
// Two sub-components exported from one file:
//   ConversationList  — renders existing conversations with last-message preview
//   UserSearchResults — renders search-result users with "Start chat" affordance

// ── Avatar helper ─────────────────────────────────────────────────────────

function Avatar({ user, isOnline, size = 'md' }) {
  const dim      = size === 'lg' ? 'w-12 h-12 text-base' : 'w-12 h-12 text-base';
  const initials = (user.displayName || user.username || 'U').substring(0, 2).toUpperCase();

  return (
    <div className="relative flex-shrink-0">
      {user.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={user.displayName || user.username}
          className={`${dim} rounded-full object-cover border border-[#e9edef]`}
        />
      ) : (
        <div className={`${dim} rounded-full bg-[#00a884]/10 border border-[#00a884]/20 flex items-center justify-center text-[#00a884] font-bold`}>
          {initials}
        </div>
      )}
      {isOnline && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] rounded-full border-2 border-white" />
      )}
    </div>
  );
}

// ── ConversationList ──────────────────────────────────────────────────────

/**
 * Renders a list of existing conversations.
 *
 * @param {object[]} conversations  - Array of conversation objects from the API
 * @param {Set}      onlineUsers    - Set of online user IDs
 * @param {string}   activeId       - Currently active conversation _id
 * @param {function} onSelect       - Called with the conversation object
 */
export function ConversationList({ conversations, onlineUsers, activeId, onSelect }) {
  if (!conversations || conversations.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-[#8696a0] leading-relaxed">
        No conversations yet.<br />Search for a contact to start chatting!
      </div>
    );
  }

  return (
    <>
      {conversations.map((conv) => {
        const user     = conv.otherUser;
        const isOnline = onlineUsers?.has(user?._id) || false;
        const isActive = conv._id?.toString() === activeId;
        const lastTime = conv.lastMessage?.sentAt
          ? new Date(conv.lastMessage.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '';

        return (
          <button
            key={conv._id}
            onClick={() => onSelect(conv)}
            className={`w-full text-left flex items-center gap-3 px-3 py-3 border-b border-[#f0f2f5] cursor-pointer transition-colors ${
              isActive ? 'bg-[#f0f2f5]' : 'hover:bg-[#f5f6f6]'
            }`}
          >
            <Avatar user={user} isOnline={isOnline} />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h4 className="font-semibold text-sm text-[#111b21] truncate">
                  {user?.displayName || user?.username || 'Unknown'}
                </h4>
                {lastTime && (
                  <span className="text-[10px] text-[#8696a0] flex-shrink-0 ml-1">{lastTime}</span>
                )}
              </div>
              <p className="text-xs text-[#667781] truncate mt-0.5">
                {conv.lastMessage ? conv.lastMessage.ciphertext : 'No messages yet'}
              </p>
            </div>
          </button>
        );
      })}
    </>
  );
}

// ── UserSearchResults ─────────────────────────────────────────────────────

/**
 * Renders search-result users (not yet conversations).
 *
 * @param {object[]} users       - Array of user objects from /api/users/search
 * @param {Set}      onlineUsers - Set of online user IDs
 * @param {boolean}  isLoading   - Show loading state
 * @param {function} onSelect    - Called with the user object
 */
export function UserSearchResults({
  users,
  onlineUsers,
  isLoading,
  onSelect,
  loadingMessage = 'Searching...',
  emptyMessage = <>No users found.<br />Try a different name or username.</>
}) {
  if (isLoading) {
    return (
      <div className="p-4 text-center text-xs text-[#667781] animate-pulse">{loadingMessage}</div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-[#8696a0] leading-relaxed">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      {users.map((usr) => {
        const isOnline = onlineUsers?.has(usr._id) || false;

        return (
          <button
            key={usr._id}
            onClick={() => onSelect(usr)}
            className="w-full text-left flex items-center gap-3 px-3 py-3 border-b border-[#f0f2f5] cursor-pointer hover:bg-[#f5f6f6] transition-colors group"
          >
            <Avatar user={usr} isOnline={isOnline} />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-[#111b21] truncate">
                {usr.displayName || usr.username}
              </h4>
              <p className="text-xs text-[#667781] truncate mt-0.5 group-hover:text-[#00a884] transition-colors">
                @{usr.username} · Start chat
              </p>
            </div>
          </button>
        );
      })}
    </>
  );
}

// Default export kept for backwards compatibility (unused but avoids import errors)
export default ConversationList;
