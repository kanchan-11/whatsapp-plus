import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { Users, X, Check, Loader2 } from 'lucide-react';

export const NewGroupModal = ({ isOpen, onClose, onCreateGroup }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Modern preset group avatars
  const groupAvatars = [
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=150&auto=format&fit=crop&q=80',
  ];

  useEffect(() => {
    if (!isOpen) {
      setName('');
      setDescription('');
      setImage('');
      setSelectedUserIds([]);
      setError('');
      return;
    }

    const loadUsers = async () => {
      setIsLoading(true);
      try {
        const list = await authService.searchUsers();
        setUsers(list);
      } catch (err) {
        console.error('Failed to load contacts', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadUsers();
  }, [isOpen]);

  const toggleUserSelection = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a group subject / name');
      return;
    }
    if (selectedUserIds.length === 0) {
      setError('Please select at least 1 member for the group');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await onCreateGroup({
        name: name.trim(),
        description: description.trim(),
        image: image || groupAvatars[0],
        memberIds: selectedUserIds,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in select-none">
      <div className="w-full max-w-lg bg-[#0f1422] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] shadow-indigo-950/40">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900/80 flex items-center justify-between border-b border-slate-800">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Create New Group
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Group Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Design Team, Core Engineers"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-750 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl text-sm text-slate-100 placeholder-slate-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Group topic, channel purpose or rules"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-750 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl text-sm text-slate-100 placeholder-slate-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Group Icon Preset
            </label>
            <div className="flex gap-2.5 mb-2">
              {groupAvatars.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt="group icon"
                  onClick={() => setImage(url)}
                  className={`w-11 h-11 rounded-2xl object-cover cursor-pointer border-2 transition ${
                    image === url ? 'border-indigo-500 scale-105 shadow-md shadow-indigo-500/30' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="Or custom icon image URL"
              className="w-full px-4 py-2 bg-slate-900 border border-slate-750 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl text-xs text-slate-100 placeholder-slate-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Select Members ({selectedUserIds.length} selected)
            </label>
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-2 max-h-48 overflow-y-auto space-y-1">
              {isLoading ? (
                <div className="py-6 text-center text-xs text-slate-400">Loading contacts...</div>
              ) : users.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">No contacts available</div>
              ) : (
                users.map((u) => {
                  const isSelected = selectedUserIds.includes(u.id);
                  return (
                    <div
                      key={u.id}
                      onClick={() => toggleUserSelection(u.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition ${
                        isSelected ? 'bg-indigo-500/15 text-white border border-indigo-500/30' : 'hover:bg-slate-800/60 text-slate-400 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={u.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`}
                          alt={u.username}
                          className="w-8 h-8 rounded-xl object-cover bg-slate-800 border border-slate-700/60"
                        />
                        <div className="truncate">
                          <p className="text-xs font-semibold text-slate-100 truncate">
                            {u.displayName || u.username}
                          </p>
                          <p className="text-[10px] text-slate-400">@{u.username}</p>
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center transition ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'border-slate-700'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-bold text-xs rounded-2xl transition flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
