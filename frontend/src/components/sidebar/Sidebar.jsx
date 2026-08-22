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
  MessageSquare,
  Sparkles,
  Layers
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
    <div className="w-full md:w-96 lg:w-[410px] h-full bg-[#0f1422] border-r border-slate-800/80 flex flex-col shrink-0 select-none">
      {/* Top Header */}
      <div className="h-18 px-5 flex items-center justify-between border-b border-slate-800/80 bg-[#0f1422]">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <span>Messages</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
              {chats.length}
            </span>
          </h2>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 text-slate-400">
          <button
            type="button"
            onClick={() => setIsNewChatOpen(true)}
            title="Start direct conversation"
            className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-indigo-600 hover:text-white transition duration-200 cursor-pointer shadow-xs border border-slate-700/50"
          >
            <MessageSquarePlus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsNewGroupOpen(true)}
            title="Create group"
            className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-indigo-600 hover:text-white transition duration-200 cursor-pointer shadow-xs border border-slate-700/50"
          >
            <Users className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-3.5 border-b border-slate-800/60 space-y-3 bg-[#0c101a]/50">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-9 py-2 bg-slate-900/90 text-sm text-slate-100 placeholder-slate-500 rounded-xl outline-none border border-slate-750 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3.5 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filter === 'ALL'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-850 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('UNREAD')}
            className={`px-3.5 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filter === 'UNREAD'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-850 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setFilter('GROUPS')}
            className={`px-3.5 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filter === 'GROUPS'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-850 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            Groups
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 pb-20 md:pb-2">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Loading conversations...
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto mb-2 border border-slate-700/50">
              <MessageSquare className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-300">No chats found</p>
            <p className="text-xs text-slate-500">
              Start a new conversation with friends or team members.
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
