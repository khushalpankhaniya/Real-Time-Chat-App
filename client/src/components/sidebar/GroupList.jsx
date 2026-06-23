// ── GroupList.jsx ─────────────────────────────────────────────────────────

import { STATIC_GROUPS } from '../../constants/staticData';

export default function GroupList() {
  return (
    <>
      {STATIC_GROUPS.map((grp) => (
        <div
          key={grp.id}
          className="flex items-center gap-3 px-3 py-3 hover:bg-[#f5f6f6] border-b border-[#f0f2f5] cursor-pointer transition-colors"
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${grp.color}`}
          >
            {grp.initials}
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="flex justify-between items-baseline">
              <h4 className="font-semibold text-sm text-[#111b21] truncate">{grp.name}</h4>
              <span className="text-[11px] text-[#8696a0]">{grp.time}</span>
            </div>
            <p className="text-xs text-[#667781] truncate mt-1">{grp.lastMessage}</p>
          </div>
        </div>
      ))}
    </>
  );
}
