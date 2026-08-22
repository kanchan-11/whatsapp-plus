import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { Users, X, Check, Loader2, Image as ImageIcon } from 'lucide-react';

export const NewGroupModal = ({ isOpen, onClose, onCreateGroup }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Sample group avatars
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-lg bg-[#111b21] border border-[#222e35] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#202c33] flex items-center justify-between border-b border-[#222e35]">
          <h2 className="text-lg font-semibold text-[#e9edef] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#00a884]" />
            New Group
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8696a0] hover:text-[#e9edef] hover:bg-[#111b21]/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#8696a0] uppercase tracking-wider mb-1.5">
              Group Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. React Developers, Family & Friends"
              className="w-full px-3.5 py-2.5 bg-[#202c33] border border-transparent focus:border-[#00a884] rounded-xl text-sm text-[#e9edef] placeholder-[#8696a0] outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8696a0] uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Group topic or purpose"
              className="w-full px-3.5 py-2 bg-[#202c33] border border-transparent focus:border-[#00a884] rounded-xl text-sm text-[#e9edef] placeholder-[#8696a0] outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8696a0] uppercase tracking-wider mb-1.5">
              Group Icon
            </label>
            <div className="flex gap-2 mb-2">
              {groupAvatars.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt="group icon"
                  onClick={() => setImage(url)}
                  className={`w-10 h-10 rounded-xl object-cover cursor-pointer border-2 transition ${
                    image === url ? 'border-[#00a884] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="Or custom icon URL"
              className="w-full px-3 py-1.5 bg-[#202c33] border border-transparent focus:border-[#00a884] rounded-xl text-xs text-[#e9edef] placeholder-[#8696a0] outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8696a0] uppercase tracking-wider mb-1.5">
              Select Participants ({selectedUserIds.length} selected)
            </label>
            <div className="bg-[#202c33]/40 border border-[#222e35] rounded-xl p-2 max-h-48 overflow-y-auto space-y-1">
              {isLoading ? (
                <div className="py-6 text-center text-xs text-[#8696a0]">Loading contacts...</div>
              ) : users.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#8696a0]">No contacts available</div>
              ) : (
                users.map((u) => {
                  const isSelected = selectedUserIds.includes(u.id);
                  return (
                    <div
                      key={u.id}
                      onClick={() => toggleUserSelection(u.id)}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                        isSelected ? 'bg-[#00a884]/15 text-[#e9edef]' : 'hover:bg-[#202c33] text-[#8696a0]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={u.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`}
                          alt={u.username}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div className="truncate">
                          <p className="text-xs font-medium text-[#e9edef] truncate">
                            {u.displayName || u.username}
                          </p>
                          <p className="text-[10px] text-[#8696a0]">@{u.username}</p>
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                          isSelected
                            ? 'bg-[#00a884] border-[#00a884] text-[#111b21]'
                            : 'border-[#8696a0]/40'
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

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm text-[#8696a0] hover:text-[#e9edef] hover:bg-[#202c33] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#00a884] hover:bg-[#00a884]/90 disabled:opacity-50 text-[#111b21] font-semibold text-sm rounded-xl transition flex items-center gap-2 cursor-pointer shadow-md"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
