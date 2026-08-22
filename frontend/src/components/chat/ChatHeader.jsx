import React from 'react';
import { Phone, Video, Users, PhoneCall, Radio } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useCall } from '../../context/CallContext';

export const ChatHeader = ({ chat, currentUserId, typingUsers, onOpenGroupInfo }) => {
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
      const presence = onlineUsers.get(otherUser.id);
      isOtherOnline = presence ? presence.isOnline : otherUser.online;
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
    <div className="h-18 bg-[#0f1422] px-6 flex items-center justify-between border-b border-slate-800/80 z-10 select-none">
      {/* Avatar & User/Group info */}
      <div
        onClick={chat.type === 'GROUP' ? onOpenGroupInfo : undefined}
        className={`flex items-center gap-3.5 min-w-0 ${chat.type === 'GROUP' ? 'cursor-pointer hover:opacity-90' : ''}`}
      >
        <div className="relative shrink-0">
          <img
            src={chat.image || `https://api.dicebear.com/7.x/initials/svg?seed=${chat.name || 'Chat'}`}
            alt={chat.name}
            className="w-11 h-11 rounded-2xl object-cover bg-slate-800 border border-slate-700/80 shadow-xs"
          />
          {chat.type === 'DIRECT' && isOtherOnline && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0f1422] rounded-full shadow-xs"></span>
          )}
        </div>

        <div className="truncate">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-100 truncate">{chat.name}</h2>
            {activeCallInGroup && (
              <span className="px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 text-[10px] font-bold rounded-full flex items-center gap-1 animate-pulse shadow-xs">
                <Radio className="w-3 h-3" />
                <span>Call Active</span>
              </span>
            )}
          </div>

          <p className="text-xs truncate text-slate-400">
            {isTyping ? (
              <span className="text-indigo-400 font-medium animate-pulse">{typingText}</span>
            ) : chat.type === 'DIRECT' ? (
              isOtherOnline ? (
                <span className="text-emerald-400 font-medium">Online</span>
              ) : (
                <span className="text-slate-500">Offline</span>
              )
            ) : (
              <span className="text-slate-400">
                {activeCallInGroup
                  ? `${activeCallInGroup.participants?.length || 1} in call • ${chat.members?.length || 0} participants`
                  : `${chat.members?.length || 0} participants`}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Action Buttons: Voice Call, Video Call, Group Info */}
      <div className="flex items-center gap-2 text-slate-300">
        {/* Quick Join Call Button if call active in group */}
        {activeCallInGroup && !isAlreadyInThisCall && (
          <button
            type="button"
            onClick={() => joinActiveGroupCall(chat.id, activeCallInGroup)}
            className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30 animate-bounce cursor-pointer mr-1"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Join Call</span>
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
          className={`p-2.5 rounded-xl transition cursor-pointer border ${
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
          className={`p-2.5 rounded-xl transition cursor-pointer border ${
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
            className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 hover:text-white border border-slate-700/50 transition cursor-pointer"
          >
            <Users className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
