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
    if (!confirm('Are you sure you want to remove this participant?')) return;
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
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
        <div className="w-full max-w-md bg-[#111b21] border border-[#222e35] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="px-5 py-4 bg-[#202c33] flex items-center justify-between border-b border-[#222e35]">
            <h2 className="text-lg font-semibold text-[#e9edef] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#00a884]" />
              Group Info
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#8696a0] hover:text-[#e9edef] hover:bg-[#111b21]/50 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Group Banner */}
            <div className="flex flex-col items-center text-center">
              <img
                src={chat.image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80'}
                alt={chat.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-[#202c33] shadow-md mb-3"
              />
              <h3 className="text-lg font-bold text-[#e9edef]">{chat.name}</h3>
              <p className="text-xs text-[#8696a0] mt-0.5">
                Group • {chat.members?.length || 0} participants
              </p>
              {chat.description && (
                <p className="text-xs text-[#8696a0] mt-2 italic bg-[#202c33]/40 p-2.5 rounded-xl w-full">
                  "{chat.description}"
                </p>
              )}
            </div>

            {/* Admin action: Add Member */}
            {isAdmin && (
              <button
                onClick={() => setIsAddingMember(true)}
                className="w-full py-2.5 px-3 bg-[#202c33] hover:bg-[#2a3942] text-[#00a884] rounded-xl flex items-center justify-center gap-2 text-xs font-semibold transition cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                Add Participants
              </button>
            )}

            {/* Participants list */}
            <div>
              <h4 className="text-xs font-semibold text-[#8696a0] uppercase tracking-wider mb-2">
                Participants
              </h4>
              <div className="space-y-1">
                {chat.members?.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#202c33] transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={member.user?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${member.user?.username}`}
                        alt={member.user?.username}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <div className="truncate">
                        <p className="text-xs font-medium text-[#e9edef] truncate flex items-center gap-1.5">
                          {member.user?.id === user?.id ? 'You' : member.user?.displayName || member.user?.username}
                        </p>
                        <p className="text-[10px] text-[#8696a0]">@{member.user?.username}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {member.role === 'ADMIN' && (
                        <span className="text-[10px] px-2 py-0.5 bg-[#00a884]/15 text-[#00a884] rounded-md font-medium border border-[#00a884]/30 flex items-center gap-1">
                          <Shield className="w-2.5 h-2.5" /> Admin
                        </span>
                      )}
                      {isAdmin && member.user?.id !== user?.id && (
                        <button
                          onClick={() => handleRemoveMember(member.user?.id)}
                          className="text-[11px] text-red-400 hover:text-red-300 hover:underline p-1 cursor-pointer"
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
                className="w-full py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
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
