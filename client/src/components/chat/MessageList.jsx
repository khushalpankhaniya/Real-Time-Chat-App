// ── MessageList.jsx ───────────────────────────────────────────────────────

import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

export default function MessageList({ messages, contact }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!contact) {
    return (
      <div className="flex-1 flex items-center justify-center z-10">
        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-full bg-[#00a884]/10 flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-[#00a884]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-[#667781] text-sm font-medium">Select a contact to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2 z-10 flex flex-col">


      {messages.map((msg) => (
        <MessageBubble key={msg._id || msg.tempId} msg={msg} />
      ))}

      <div ref={bottomRef} />
    </div>
  );
}
