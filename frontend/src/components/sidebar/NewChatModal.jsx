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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in select-none">
      <div className="w-full max-w-md bg-[#0f1422] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] shadow-indigo-950/40">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900/80 flex items-center justify-between border-b border-slate-800">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            New Conversation
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 bg-slate-900/40 border-b border-slate-800">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, username or email..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-750 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl text-sm text-slate-100 placeholder-slate-500 outline-none transition"
            />
          </div>
        </div>

        {/* Users list */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1 min-h-[220px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400 mb-2" />
              <p className="text-xs">Finding contacts...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
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
                className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-slate-800/60 cursor-pointer transition border border-transparent hover:border-slate-750"
              >
                <div className="relative">
                  <img
                    src={u.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`}
                    alt={u.displayName || u.username}
                    className="w-11 h-11 rounded-2xl object-cover bg-slate-800 border border-slate-700/80"
                  />
                  {u.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0f1422] rounded-full shadow-xs"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-100 truncate">
                      {u.displayName || u.username}
                    </h3>
                    <span className="text-xs text-slate-400">@{u.username}</span>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
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
