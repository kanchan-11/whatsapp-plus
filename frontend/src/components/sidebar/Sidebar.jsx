import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ChatListItem } from './ChatListItem';
import { NewChatModal } from './NewChatModal';
import { NewGroupModal } from './NewGroupModal';
import { 
  MessageSquarePlus, 
  Users, 
  Search, 
  X,
  MessageSquare
} from 'lucide-react';

export const Sidebar = ({
  chats,
  selectedChatId,
  onSelectChat,
  onStartDirectChat,
  onCreateGroupChat,
  isLoading,
}) => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL, UNREAD, GROUPS
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);

  // Filtered chats
  const filteredChats = chats.filter((chat) => {
    const matchesSearch = chat.name?.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (filter === 'UNREAD') return chat.unreadCount > 0;
    if (filter === 'GROUPS') return chat.type === 'GROUP';
    return true;
  });

  return (
    <div className="w-full md:w-96 lg:w-[420px] h-full bg-[#111b21] border-r border-[#222e35] flex flex-col shrink-0 select-none">
      {/* Top Header */}
      <div className="h-16 bg-[#202c33] px-4 flex items-center justify-between border-b border-[#222e35]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#00a884]/15 text-[#00a884] flex items-center justify-center font-bold">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-[#e9edef] tracking-tight">Chats</h2>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 text-[#aebac1]">
          <button
            type="button"
            onClick={() => setIsNewChatOpen(true)}
            title="New direct chat"
            className="p-2 rounded-full hover:bg-[#374248] hover:text-[#e9edef] transition cursor-pointer"
          >
            <MessageSquarePlus className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setIsNewGroupOpen(true)}
            title="New group chat"
            className="p-2 rounded-full hover:bg-[#374248] hover:text-[#e9edef] transition cursor-pointer"
          >
            <Users className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-2.5 border-b border-[#222e35] space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8696a0]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search or start new chat"
            className="w-full pl-10 pr-9 py-1.5 bg-[#202c33] text-sm text-[#e9edef] placeholder-[#8696a0] rounded-lg outline-none border border-transparent focus:border-[#00a884] transition"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8696a0] hover:text-[#e9edef]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 px-1">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
              filter === 'ALL'
                ? 'bg-[#00a884] text-[#111b21]'
                : 'bg-[#202c33] text-[#8696a0] hover:bg-[#374248] hover:text-[#e9edef]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('UNREAD')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
              filter === 'UNREAD'
                ? 'bg-[#00a884] text-[#111b21]'
                : 'bg-[#202c33] text-[#8696a0] hover:bg-[#374248] hover:text-[#e9edef]'
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setFilter('GROUPS')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
              filter === 'GROUPS'
                ? 'bg-[#00a884] text-[#111b21]'
                : 'bg-[#202c33] text-[#8696a0] hover:bg-[#374248] hover:text-[#e9edef]'
            }`}
          >
            Groups
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#222e35]/50">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#8696a0]">
            Loading conversations...
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="p-8 text-center text-[#8696a0] space-y-3">
            <p className="text-sm">No chats found</p>
            <p className="text-xs">
              Click the <MessageSquarePlus className="w-3.5 h-3.5 inline mx-1 text-[#00a884]" /> button above to start a conversation!
            </p>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              isSelected={selectedChatId === chat.id}
              onClick={() => onSelectChat(chat.id)}
            />
          ))
        )}
      </div>

      {/* New Direct Chat Modal */}
      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        onSelectUser={(target) => {
          setIsNewChatOpen(false);
          onStartDirectChat(target);
        }}
      />

      {/* New Group Chat Modal */}
      <NewGroupModal
        isOpen={isNewGroupOpen}
        onClose={() => setIsNewGroupOpen(false)}
        onCreateGroup={(groupData) => {
          setIsNewGroupOpen(false);
          onCreateGroupChat(groupData);
        }}
      />
    </div>
  );
};
