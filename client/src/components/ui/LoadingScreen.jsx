// ── LoadingScreen.jsx ─────────────────────────────────────────────────────

export default function LoadingScreen({ message = 'Loading Real-Time Chat App...' }) {
  return (
    <div className="min-h-screen bg-[#f0f2f5] text-slate-700 flex flex-col justify-center items-center font-sans">
      <div className="text-center space-y-6 flex flex-col items-center">
        <div className="relative w-16 h-16 flex items-center justify-center bg-[#00a884] rounded-full shadow-md">
          <span className="text-white font-bold text-2xl">RT</span>
        </div>
        <div className="space-y-2 max-w-xs">
          <p className="text-sm font-semibold tracking-wider text-[#00a884] uppercase">
            Real-Time Chat App
          </p>
          <div className="w-48 h-1 bg-[#e9edef] rounded-full overflow-hidden mx-auto relative">
            <div className="absolute top-0 left-0 h-full bg-[#00a884] rounded-full w-2/3 animate-loading-bar" />
          </div>
          <p className="text-xs text-[#667781] font-mono mt-2 animate-pulse">{message}</p>
        </div>
      </div>
    </div>
  );
}
