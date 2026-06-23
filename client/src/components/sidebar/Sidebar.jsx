// ── Sidebar.jsx ───────────────────────────────────────────────────────────

import { useState } from 'react';
import SidebarHeader from './SidebarHeader';
import { ConversationList, UserSearchResults } from './ContactList';


/**
 * @param {object}   profile          - Current user's profile
 * @param {object[]} conversations    - Conversations list from API
 * @param {object[]} searchResults    - Users returned by search API
 * @param {Set}      onlineUsers      - Set of online user IDs
 * @param {string}   activeId         - Active conversation _id
 * @param {string}   searchQuery      - Controlled search query string
 * @param {function} setSearchQuery   - Setter for searchQuery
 * @param {boolean}  isSearching      - True while search request is in-flight
 * @param {function} onSelectContact  - Called with a user object (from search results)
 * @param {function} onSelectConv     - Called with a conversation object (from list)
 */
export default function Sidebar({
  profile,
  conversations,
  searchResults,
  onlineUsers,
  activeId,
  searchQuery,
  setSearchQuery,
  isSearching,
  onSelectContact,
  onSelectConv,
  allUsers = [],
  isLoadingAllUsers = false,
}) {
  const [activeTab, setActiveTab] = useState('chats');

  return (
    <div className="w-[30%] min-w-[300px] max-w-[400px] border-r border-[#e9edef] bg-white flex flex-col h-full">
      <SidebarHeader profile={profile} />

      {/* Search bar */}
      <div className="bg-white py-2 px-3 border-b border-[#f0f2f5] flex items-center">
        <div className="bg-[#f0f2f5] rounded-lg w-full flex items-center px-3 py-1.5">
          <svg className="w-4 h-4 text-[#667781] mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contacts"
            className="bg-transparent text-sm text-[#111b21] placeholder-[#667781] w-full focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[#667781] hover:text-[#111b21] ml-2 flex-shrink-0"
              aria-label="Clear search"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Tab bar — hidden while searching */}
      {!searchQuery && (
        <div className="flex border-b border-[#e9edef] text-sm font-medium bg-[#f0f2f5]">
          {[
            { id: 'chats', label: 'Chats' },
            { id: 'users', label: 'Users' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-center border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#00a884] text-[#00a884] font-semibold bg-white'
                  : 'border-transparent text-[#667781] hover:bg-white/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* List area */}
      <div className="flex-1 overflow-y-auto bg-white">
        {searchQuery ? (
          // Search mode — show user results
          <UserSearchResults
            users={searchResults}
            onlineUsers={onlineUsers}
            isLoading={isSearching}
            onSelect={onSelectContact}
          />
        ) : activeTab === 'chats' ? (
          // Conversation list
          <ConversationList
            conversations={conversations}
            onlineUsers={onlineUsers}
            activeId={activeId}
            onSelect={onSelectConv}
          />
        ) : (
          // All users list
          <UserSearchResults
            users={allUsers}
            onlineUsers={onlineUsers}
            isLoading={isLoadingAllUsers}
            onSelect={onSelectContact}
            loadingMessage="Loading users..."
            emptyMessage={
              <>
                No users found.<br />Waiting for other users to register.
              </>
            }
          />
        )}
      </div>
    </div>
  );
}
