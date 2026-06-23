// ── MessageInput.jsx ──────────────────────────────────────────────────────

import { useRef } from 'react';

/**
 * @param {string}   value          - Controlled input value
 * @param {function} onChange       - Input change handler
 * @param {function} onSubmit       - Form submit handler
 * @param {function} onTypingStart  - Called when the user starts typing
 * @param {function} onTypingStop   - Called when the user stops typing (debounced 2 s)
 */
export default function MessageInput({
  value,
  onChange,
  onSubmit,
  onTypingStart,
  onTypingStop,
  disabled = false,
  placeholder = "Type a message",
}) {
  const typingTimerRef = useRef(null);
  const isTypingRef    = useRef(false);

  const handleKeyDown = () => {
    // Fire start only once until the stop fires
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onTypingStart?.();
    }

    // Reset the inactivity timer on every keystroke
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      onTypingStop?.();
    }, 2000);
  };

  const handleBlur = () => {
    // Immediately stop typing indicator when the input loses focus
    clearTimeout(typingTimerRef.current);
    if (isTypingRef.current) {
      isTypingRef.current = false;
      onTypingStop?.();
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="bg-[#f0f2f5] px-4 py-3 flex items-center gap-4 z-10 border-t border-[#e9edef]"
    >


      {/* Text input */}
      <input
        type="text"
        required
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 bg-white rounded-lg px-4 py-2 text-sm text-[#111b21] placeholder-[#8696a0] focus:outline-none border border-transparent focus:border-[#e1e9eb] shadow-sm disabled:bg-[#f8f9fa] disabled:cursor-not-allowed disabled:text-[#8696a0]"
      />

      {/* Send button */}
      <button
        type="submit"
        disabled={disabled}
        className="text-[#00a884] hover:text-[#008f72] transition-colors cursor-pointer disabled:text-[#8696a0] disabled:cursor-not-allowed"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </form>
  );
}
