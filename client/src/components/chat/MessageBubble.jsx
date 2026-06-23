// ── MessageBubble.jsx ─────────────────────────────────────────────────────

export default function MessageBubble({ msg }) {
  // System / notification banner
  if (msg.isSystem) {
    return (
      <div className="self-center bg-[#ffeecf] text-[#54656f] text-[11px] rounded-lg px-4 py-1.5 shadow-sm max-w-sm text-center border border-[#ffd89e] leading-snug">
        {msg.text}
      </div>
    );
  }

  // msg.text   → local optimistic bubble (before server confirms)
  // msg.plaintext → decrypted text once confirmed (future)
  const body = msg.text || msg.plaintext || '🔒';

  const time = msg.time || (msg.sentAt
    ? new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '');

  return (
    <div
      className={`flex flex-col max-w-[65%] rounded-lg px-3 py-1.5 text-sm shadow-sm relative ${
        msg.isSent
          ? 'self-end bg-[#d9fdd3] text-[#111b21] rounded-tr-none'
          : 'self-start bg-white text-[#111b21] rounded-tl-none'
      }`}
    >
      {!msg.isSent && msg.senderName && (
        <span className="text-[11px] font-semibold text-emerald-600 block mb-0.5">
          {msg.senderName}
        </span>
      )}
      <p className="text-left text-[#111b21] leading-relaxed break-words pr-16">{body}</p>
      <span className="text-[9px] text-[#667781] absolute bottom-1 right-2 flex items-center gap-0.5 select-none">
        {time}
        {msg.isSent && (
          <svg className="w-3 h-3 text-[#53bdeb]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
          </svg>
        )}
      </span>
    </div>
  );
}
