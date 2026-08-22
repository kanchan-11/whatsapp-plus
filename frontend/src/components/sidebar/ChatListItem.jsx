import React from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { Image, Video, Mic, FileText, Check, CheckCheck, Users } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

export const ChatListItem = ({ chat, isSelected, onClick, currentUserId }) => {
  const { onlineUsers } = useSocket();

  // Determine online status for DIRECT chats
  let isOtherUserOnline = false;
  if (chat.type === 'DIRECT' && chat.members) {
    const otherMember = chat.members.find((m) => m.user?.id !== currentUserId);
    if (otherMember?.user) {
      const presence = onlineUsers.get(otherMember.user.id);
      isOtherUserOnline = presence ? presence.isOnline : otherMember.user.online;
    }
  }

  // Format timestamp
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isToday(date)) {
      return format(date, 'HH:mm');
    }
    if (isYesterday(date)) {
      return 'Yesterday';
    }
    return format(date, 'dd/MM/yy');
  };

  // Render last message preview
  const renderLastMessage = () => {
    if (!chat.lastMessage) {
      return <span className="italic text-[#8696a0]">Tap to start chatting</span>;
    }

    const msg = chat.lastMessage;
    const isMe = msg.sender?.id === currentUserId;

    return (
      <div className="flex items-center gap-1 text-xs text-[#8696a0] truncate">
        {isMe && (
          <span className="shrink-0 text-[#8696a0]">
            {msg.status === 'READ' ? (
              <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
            ) : msg.status === 'DELIVERED' ? (
              <CheckCheck className="w-3.5 h-3.5 text-[#8696a0]" />
            ) : (
              <Check className="w-3.5 h-3.5 text-[#8696a0]" />
            )}
          </span>
        )}

        {msg.type === 'IMAGE' && (
          <span className="flex items-center gap-1">
            <Image className="w-3 h-3 text-[#8696a0]" /> Photo
          </span>
        )}
        {msg.type === 'VIDEO' && (
          <span className="flex items-center gap-1">
            <Video className="w-3 h-3 text-[#8696a0]" /> Video
          </span>
        )}
        {msg.type === 'AUDIO' && (
          <span className="flex items-center gap-1">
            <Mic className="w-3 h-3 text-[#8696a0]" /> Voice message
          </span>
        )}
        {msg.type === 'FILE' && (
          <span className="flex items-center gap-1">
            <FileText className="w-3 h-3 text-[#8696a0]" /> Document
          </span>
        )}
        {msg.type === 'TEXT' && (
          <span className="truncate">{msg.content}</span>
        )}
      </div>
    );
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-3.5 py-3 cursor-pointer transition border-b border-[#222e35]/50 ${
        isSelected ? 'bg-[#2a3942]' : 'hover:bg-[#202c33]'
      }`}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <img
          src={chat.image || `https://api.dicebear.com/7.x/initials/svg?seed=${chat.name || 'Chat'}`}
          alt={chat.name}
          className="w-12 h-12 rounded-full object-cover bg-[#202c33]"
        />
        {chat.type === 'DIRECT' ? (
          isOtherUserOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] border-2 border-[#111b21] rounded-full"></span>
          )
        ) : (
          <span className="absolute bottom-0 right-0 w-4 h-4 bg-[#202c33] border border-[#111b21] rounded-full flex items-center justify-center text-[#8696a0]">
            <Users className="w-2.5 h-2.5" />
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-medium text-[#e9edef] truncate">{chat.name}</h3>
          <span className={`text-[11px] shrink-0 ${chat.unreadCount > 0 ? 'text-[#00a884] font-medium' : 'text-[#8696a0]'}`}>
            {formatTime(chat.lastMessage?.createdAt || chat.updatedAt)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="truncate pr-2">{renderLastMessage()}</div>
          {chat.unreadCount > 0 && (
            <span className="shrink-0 min-w-5 h-5 px-1.5 bg-[#00a884] text-[#111b21] text-[11px] font-bold rounded-full flex items-center justify-center shadow-xs">
              {chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
