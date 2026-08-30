import React from 'react';
import { Phone, Video, Users, PhoneCall, Radio, ChevronLeft } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useCall } from '../../context/CallContext';

export const ChatHeader = ({ chat, currentUserId, typingUsers, onOpenGroupInfo, onBack }) => {
  const { onlineUsers } = useSocket();
  const { startCall, startGroupCall, joinActiveGroupCall, activeGroupCalls, isGroupCall, groupInfo } = useCall();

  if (!chat) return null;

  const activeCallInGroup = chat.type === 'GROUP' ? activeGroupCalls[chat.id] : null;
  const isAlreadyInThisCall = isGroupCall && groupInfo?.id === chat.id;

  // Determine other participant for 1-on-1 chats
  let otherUser = null;
  let isOtherOnline = false;
  if (chat.type === 'DIRECT' && chat.members) {
    const otherMember = chat.members.find((m) => m.user?.id !== currentUserId);
    if (otherMember?.user) {
      otherUser = otherMember.user;
      const presence = onlineUsers.get(otherUser.id) || onlineUsers.get(Number(otherUser.id));
      isOtherOnline = presence !== undefined ? Boolean(presence.isOnline) : Boolean(otherUser.online);
    }
  }

  // Check if anyone is currently typing
  const isTyping = typingUsers && typingUsers.length > 0;
  const typingText = isTyping
    ? chat.type === 'GROUP'
      ? `${typingUsers.map((u) => u.displayName || u.username).join(', ')} is typing...`
      : 'typing...'
    : null;

  const handleStartVoiceCall = () => {
    if (chat.type === 'GROUP') {
      if (activeCallInGroup) {
        joinActiveGroupCall(chat.id, activeCallInGroup);
      } else {
        startGroupCall(chat, 'AUDIO');
      }
    } else if (otherUser) {
      startCall(otherUser, 'AUDIO', chat.id);
    }
  };

  const handleStartVideoCall = () => {
    if (chat.type === 'GROUP') {
      if (activeCallInGroup) {
        joinActiveGroupCall(chat.id, activeCallInGroup);
      } else {
        startGroupCall(chat, 'VIDEO');
      }
    } else if (otherUser) {
      startCall(otherUser, 'VIDEO', chat.id);
    }
  };

  return (
    <div className="h-16 sm:h-18 bg-[#0f1422] px-3 sm:px-6 flex items-center justify-between border-b border-slate-800/80 z-10 select-none shrink-0">
      {/* Left: Mobile Back Button & Avatar & Info */}
      <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
        {/* Mobile Back to Chat List Button */}
        <button
          type="button"
          onClick={onBack}
          className="md:hidden p-1.5 -ml-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer shrink-0"
          title="Back to chats"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div
          onClick={chat.type === 'GROUP' ? onOpenGroupInfo : undefined}
          className={`flex items-center gap-2.5 sm:gap-3.5 min-w-0 ${chat.type === 'GROUP' ? 'cursor-pointer hover:opacity-90' : ''}`}
        >
          <div className="relative shrink-0">
            <img
              src={chat.image || `https://api.dicebear.com/7.x/initials/svg?seed=${chat.name || 'Chat'}`}
              alt={chat.name}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl object-cover bg-slate-800 border border-slate-700/80 shadow-xs"
            />
            {chat.type === 'DIRECT' && isOtherOnline && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-emerald-500 border-2 border-[#0f1422] rounded-full shadow-xs"></span>
            )}
          </div>

          <div className="truncate">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-100 truncate max-w-[130px] sm:max-w-[200px] md:max-w-xs">{chat.name}</h2>
              {activeCallInGroup && (
                <span className="px-1.5 sm:px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 text-[9px] sm:text-[10px] font-bold rounded-full flex items-center gap-1 animate-pulse shadow-xs shrink-0">
                  <Radio className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span className="hidden xs:inline">Call Active</span>
                </span>
              )}
            </div>

            <p className="text-[11px] sm:text-xs truncate text-slate-400">
              {isTyping ? (
                <span className="text-indigo-400 font-medium animate-pulse">{typingText}</span>
              ) : chat.type === 'DIRECT' ? (
                isOtherOnline ? (
                  <span className="text-emerald-400 font-medium">Online</span>
                ) : (
                  <span className="text-slate-500">Offline</span>
                )
              ) : (
                <span className="text-slate-400 truncate">
                  {activeCallInGroup
                    ? `${activeCallInGroup.participants?.length || 1} in call • ${chat.members?.length || 0} members`
                    : `${chat.members?.length || 0} members`}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Right: Action Buttons (Voice Call, Video Call, Group Info) */}
      <div className="flex items-center gap-1.5 sm:gap-2 text-slate-300 shrink-0">
        {/* Quick Join Call Button if call active in group */}
        {activeCallInGroup && !isAlreadyInThisCall && (
          <button
            type="button"
            onClick={() => joinActiveGroupCall(chat.id, activeCallInGroup)}
            className="px-2.5 sm:px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-[11px] sm:text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30 animate-bounce cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Join Call</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleStartVoiceCall}
          title={
            chat.type === 'GROUP'
              ? activeCallInGroup
                ? 'Join Ongoing Voice Call'
                : 'Start Group Voice Call'
              : 'Voice Call'
          }
          className={`p-2 sm:p-2.5 rounded-xl transition cursor-pointer border ${
            activeCallInGroup && activeCallInGroup.callType === 'AUDIO'
              ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
              : 'bg-slate-800/60 hover:bg-indigo-600 hover:text-white border-slate-700/50'
          }`}
        >
          <Phone className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleStartVideoCall}
          title={
            chat.type === 'GROUP'
              ? activeCallInGroup
                ? 'Join Ongoing Video Call'
                : 'Start Group Video Call'
              : 'Video Call'
          }
          className={`p-2 sm:p-2.5 rounded-xl transition cursor-pointer border ${
            activeCallInGroup && activeCallInGroup.callType === 'VIDEO'
              ? 'bg-violet-600 text-white border-violet-400 shadow-md shadow-violet-600/30'
              : 'bg-slate-800/60 hover:bg-violet-600 hover:text-white border-slate-700/50'
          }`}
        >
          <Video className="w-4 h-4" />
        </button>

        {chat.type === 'GROUP' && (
          <button
            type="button"
            onClick={onOpenGroupInfo}
            title="Group Info"
            className="p-2 sm:p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 hover:text-white border border-slate-700/50 transition cursor-pointer"
          >
            <Users className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
