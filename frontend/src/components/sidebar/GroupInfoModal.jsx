import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { chatService } from '../../services/chatService';
import { Users, X, Shield, UserPlus, LogOut, Loader2 } from 'lucide-react';
import { NewChatModal } from './NewChatModal';

export const GroupInfoModal = ({ isOpen, onClose, chat, onGroupUpdated }) => {
  const { user } = useAuth();
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !chat || chat.type !== 'GROUP') return null;

  const currentMember = chat.members?.find((m) => m.user?.id === user?.id);
  const isAdmin = currentMember?.role === 'ADMIN';

  const handleAddMember = async (selectedUser) => {
    setIsLoading(true);
    try {
      const updated = await chatService.updateGroupChat(chat.id, {
        addMemberIds: [selectedUser.id],
      });
      if (onGroupUpdated) onGroupUpdated(updated);
    } catch (err) {
      console.error('Failed to add member', err);
      alert(err.response?.data?.message || 'Failed to add member to group');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (targetUserId) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    setIsLoading(true);
    try {
      const updated = await chatService.updateGroupChat(chat.id, {
        removeMemberIds: [targetUserId],
      });
      if (onGroupUpdated) onGroupUpdated(updated);
    } catch (err) {
      console.error('Failed to remove member', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!confirm('Are you sure you want to leave this group?')) return;
    setIsLoading(true);
    try {
      await chatService.updateGroupChat(chat.id, {
        removeMemberIds: [user.id],
      });
      onClose();
      window.location.reload();
    } catch (err) {
      console.error('Failed to leave group', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in select-none">
        <div className="w-full max-w-md bg-[#0f1422] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] shadow-indigo-950/40">
          {/* Header */}
          <div className="px-6 py-4 bg-slate-900/80 flex items-center justify-between border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              Group Details
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Group Banner */}
            <div className="flex flex-col items-center text-center">
              <img
                src={chat.image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80'}
                alt={chat.name}
                className="w-20 h-20 rounded-3xl object-cover border-2 border-slate-750 shadow-xl mb-3 ring-2 ring-indigo-500/20"
              />
              <h3 className="text-lg font-extrabold text-white">{chat.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                Group • {chat.members?.length || 0} participants
              </p>
              {chat.description && (
                <p className="text-xs text-slate-300 mt-3 italic bg-slate-900/70 border border-slate-800 p-3 rounded-2xl w-full leading-relaxed">
                  "{chat.description}"
                </p>
              )}
            </div>

            {/* Admin action: Add Member */}
            {isAdmin && (
              <button
                onClick={() => setIsAddingMember(true)}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl flex items-center justify-center gap-2 text-xs font-bold transition cursor-pointer shadow-md shadow-indigo-600/30"
              >
                <UserPlus className="w-4 h-4" />
                Add Members
              </button>
            )}

            {/* Participants list */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Participants
              </h4>
              <div className="space-y-1.5">
                {chat.members?.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-800/60 transition border border-transparent hover:border-slate-750"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={member.user?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${member.user?.username}`}
                        alt={member.user?.username}
                        className="w-9 h-9 rounded-xl object-cover bg-slate-800 border border-slate-700/60"
                      />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-slate-100 truncate flex items-center gap-1.5">
                          {member.user?.id === user?.id ? 'You' : member.user?.displayName || member.user?.username}
                        </p>
                        <p className="text-[10px] text-slate-400">@{member.user?.username}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {member.role === 'ADMIN' && (
                        <span className="text-[10px] px-2 py-0.5 bg-indigo-500/15 text-indigo-300 rounded-lg font-bold border border-indigo-500/30 flex items-center gap-1">
                          <Shield className="w-2.5 h-2.5" /> Admin
                        </span>
                      )}
                      {isAdmin && member.user?.id !== user?.id && (
                        <button
                          onClick={() => handleRemoveMember(member.user?.id)}
                          className="text-[11px] text-rose-400 hover:text-rose-300 hover:underline p-1 cursor-pointer font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Leave group button */}
            <div className="pt-2">
              <button
                onClick={handleLeaveGroup}
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Exit Group
              </button>
            </div>
          </div>
        </div>
      </div>

      <NewChatModal
        isOpen={isAddingMember}
        onClose={() => setIsAddingMember(false)}
        onSelectUser={handleAddMember}
      />
    </>
  );
};
