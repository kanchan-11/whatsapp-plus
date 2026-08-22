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
    <div className="h-16 bg-[#202c33] px-4 flex items-center justify-between border-b border-[#222e35] z-10 select-none">
      {/* Avatar & User/Group info */}
      <div
        onClick={chat.type === 'GROUP' ? onOpenGroupInfo : undefined}
        className={`flex items-center gap-3 min-w-0 ${chat.type === 'GROUP' ? 'cursor-pointer hover:opacity-90' : ''}`}
      >
        <div className="relative shrink-0">
          <img
            src={chat.image || `https://api.dicebear.com/7.x/initials/svg?seed=${chat.name || 'Chat'}`}
            alt={chat.name}
            className="w-10 h-10 rounded-full object-cover bg-[#111b21] border border-[#374248]"
          />
          {chat.type === 'DIRECT' && isOtherOnline && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00a884] border-2 border-[#202c33] rounded-full"></span>
          )}
        </div>

        <div className="truncate">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-[#e9edef] truncate">{chat.name}</h2>
            {activeCallInGroup && (
              <span className="px-2 py-0.5 bg-[#00a884]/20 border border-[#00a884]/40 text-[#00a884] text-[10px] font-semibold rounded-full flex items-center gap-1 animate-pulse">
                <Radio className="w-3 h-3" />
                <span>Call Active</span>
              </span>
            )}
          </div>

          <p className="text-xs truncate">
            {isTyping ? (
              <span className="text-[#00a884] font-medium animate-pulse">{typingText}</span>
            ) : chat.type === 'DIRECT' ? (
              isOtherOnline ? (
                <span className="text-[#00a884] font-medium">online</span>
              ) : (
                <span className="text-[#8696a0]">offline</span>
              )
            ) : (
              <span className="text-[#8696a0]">
                {activeCallInGroup
                  ? `${activeCallInGroup.participants?.length || 1} in call • ${chat.members?.length || 0} participants`
                  : `${chat.members?.length || 0} participants`}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Action Buttons: Voice Call, Video Call, Group Info */}
      <div className="flex items-center gap-1.5 text-[#aebac1]">
        {/* Quick Join Call Button if call active in group */}
        {activeCallInGroup && !isAlreadyInThisCall && (
          <button
            type="button"
            onClick={() => joinActiveGroupCall(chat.id, activeCallInGroup)}
            className="px-3 py-1.5 bg-[#00a884] hover:bg-[#00a884]/90 text-[#111b21] text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-md animate-bounce cursor-pointer mr-1"
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
          className={`p-2.5 rounded-full transition cursor-pointer ${
            activeCallInGroup && activeCallInGroup.callType === 'AUDIO'
              ? 'bg-[#00a884]/20 text-[#00a884] ring-2 ring-[#00a884]'
              : 'hover:bg-[#374248] hover:text-[#00a884]'
          }`}
        >
          <Phone className="w-5 h-5" />
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
          className={`p-2.5 rounded-full transition cursor-pointer ${
            activeCallInGroup && activeCallInGroup.callType === 'VIDEO'
              ? 'bg-[#00a884]/20 text-[#00a884] ring-2 ring-[#00a884]'
              : 'hover:bg-[#374248] hover:text-[#00a884]'
          }`}
        >
          <Video className="w-5 h-5" />
        </button>

        {chat.type === 'GROUP' && (
          <button
            type="button"
            onClick={onOpenGroupInfo}
            title="Group Info"
            className="p-2.5 rounded-full hover:bg-[#374248] hover:text-[#e9edef] transition cursor-pointer"
          >
            <Users className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
