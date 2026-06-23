// ── ChatHeader.jsx ────────────────────────────────────────────────────────

export default function ChatHeader({ contact, isOnline, isTyping }) {
  if (!contact) {
    return (
      <div className="bg-[#f0f2f5] h-[59px] px-4 flex items-center border-b border-[#e9edef] z-10">
        <p className="text-sm text-[#667781]">Select a contact to start chatting</p>
      </div>
    );
  }

  const initials = (contact.displayName || contact.username || '?').substring(0, 2).toUpperCase();

  // Status line: show "typing..." when the other user is typing, otherwise online/offline
  const statusLine = isTyping
    ? 'typing...'
    : isOnline
      ? 'online'
      : contact.status || 'offline';

  const statusColor = isTyping
    ? 'text-[#00a884] animate-pulse'
    : isOnline
      ? 'text-[#00a884]'
      : 'text-[#667781]';

  return (
    <div className="bg-[#f0f2f5] h-[59px] px-4 py-2 flex items-center justify-between border-b border-[#e9edef] z-10">
      {/* Contact info */}
      <div className="flex items-center gap-3 text-left">
        <div className="relative flex-shrink-0">
          {contact.avatarUrl ? (
            <img
              src={contact.avatarUrl}
              alt={contact.displayName || contact.username}
              className="w-10 h-10 rounded-full object-cover border border-[#e9edef]"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#00a884]/20 flex items-center justify-center text-[#00a884] font-bold text-sm">
              {initials}
            </div>
          )}
          {/* Online dot */}
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00a884] rounded-full border-2 border-white" />
          )}
        </div>
        <div>
          <h4 className="font-semibold text-sm text-[#111b21]">
            {contact.displayName || contact.username}
          </h4>
          <p className={`text-[11px] capitalize ${statusColor}`}>
            {statusLine}
          </p>
        </div>
      </div>

    </div>
  );
}
