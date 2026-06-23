// ── SidebarHeader.jsx ─────────────────────────────────────────────────────

import { UserButton } from '@clerk/clerk-react';

export default function SidebarHeader({ profile }) {
  return (
    <div className="bg-[#f0f2f5] h-[59px] px-4 py-2 flex items-center justify-between border-b border-[#e9edef]">
      {/* Avatar + name */}
      <div className="flex items-center gap-3">
        <div className="p-0.5 border border-[#d1d7db] rounded-full bg-white flex items-center justify-center">
          <UserButton appearance={{ elements: { userButtonAvatarBox: 'w-10 h-10' } }} />
        </div>
        <div className="hidden lg:block text-left">
          <p className="text-sm font-semibold text-[#111b21] leading-none">{profile.displayName}</p>
          <p className="text-[11px] text-[#667781] mt-0.5">@{profile.username}</p>
        </div>
      </div>

    </div>
  );
}
