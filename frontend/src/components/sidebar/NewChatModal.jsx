import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { Search, X, MessageSquare, Loader2 } from 'lucide-react';

export const NewChatModal = ({ isOpen, onClose, onSelectUser }) => {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const list = await authService.searchUsers(search);
        setUsers(list);
      } catch (err) {
        console.error('Failed to search users', err);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [search, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md bg-[#111b21] border border-[#222e35] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#202c33] flex items-center justify-between border-b border-[#222e35]">
          <h2 className="text-lg font-semibold text-[#e9edef] flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#00a884]" />
            New Direct Chat
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8696a0] hover:text-[#e9edef] hover:bg-[#111b21]/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 bg-[#111b21] border-b border-[#222e35]">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8696a0]" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, username or email..."
              className="w-full pl-10 pr-4 py-2 bg-[#202c33] border border-transparent focus:border-[#00a884] rounded-xl text-sm text-[#e9edef] placeholder-[#8696a0] outline-none transition"
            />
          </div>
        </div>

        {/* Users list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-[220px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-[#8696a0]">
              <Loader2 className="w-6 h-6 animate-spin text-[#00a884] mb-2" />
              <p className="text-xs">Finding contacts...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-[#8696a0] text-sm">
              No contacts found matching "{search}"
            </div>
          ) : (
            users.map((u) => (
              <div
                key={u.id}
                onClick={() => {
                  onSelectUser(u);
                  onClose();
                }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#202c33] cursor-pointer transition"
              >
                <div className="relative">
                  <img
                    src={u.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`}
                    alt={u.displayName || u.username}
                    className="w-11 h-11 rounded-full object-cover bg-[#202c33]"
                  />
                  {u.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] border-2 border-[#111b21] rounded-full"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[#e9edef] truncate">
                      {u.displayName || u.username}
                    </h3>
                    <span className="text-xs text-[#8696a0]">@{u.username}</span>
                  </div>
                  <p className="text-xs text-[#8696a0] truncate mt-0.5">
                    {u.statusBio || 'Available'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
