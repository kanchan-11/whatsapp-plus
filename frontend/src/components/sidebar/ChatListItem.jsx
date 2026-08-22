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
    try {
      const date = new Date(dateStr);
      if (isToday(date)) {
        return format(date, 'h:mm a');
      }
      if (isYesterday(date)) {
        return 'Yesterday';
      }
      return format(date, 'MMM d');
    } catch {
      return '';
    }
  };

  // Render last message preview
  const renderLastMessage = () => {
    if (!chat.lastMessage) {
      return <span className="italic text-slate-500">Tap to start chatting</span>;
    }

    const msg = chat.lastMessage;
    const isMe = msg.sender?.id === currentUserId;

    return (
      <div className="flex items-center gap-1.5 text-xs text-slate-400 truncate">
        {isMe && (
          <span className="shrink-0 text-slate-400">
            {msg.status === 'READ' ? (
              <CheckCheck className="w-3.5 h-3.5 text-indigo-400" />
            ) : msg.status === 'DELIVERED' ? (
              <CheckCheck className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <Check className="w-3.5 h-3.5 text-slate-400" />
            )}
          </span>
        )}

        {msg.type === 'IMAGE' && (
          <span className="flex items-center gap-1 text-slate-300">
            <Image className="w-3.5 h-3.5 text-indigo-400" /> Photo
          </span>
        )}
        {msg.type === 'VIDEO' && (
          <span className="flex items-center gap-1 text-slate-300">
            <Video className="w-3.5 h-3.5 text-violet-400" /> Video
          </span>
        )}
        {msg.type === 'AUDIO' && (
          <span className="flex items-center gap-1 text-slate-300">
            <Mic className="w-3.5 h-3.5 text-emerald-400" /> Voice note
          </span>
        )}
        {msg.type === 'FILE' && (
          <span className="flex items-center gap-1 text-slate-300">
            <FileText className="w-3.5 h-3.5 text-amber-400" /> Attachment
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
      className={`flex items-center gap-3.5 px-3.5 py-3 rounded-2xl cursor-pointer transition duration-150 relative ${
        isSelected
          ? 'bg-indigo-500/15 border border-indigo-500/30 text-white shadow-sm'
          : 'hover:bg-slate-800/50 text-slate-200 border border-transparent'
      }`}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <img
          src={chat.image || `https://api.dicebear.com/7.x/initials/svg?seed=${chat.name || 'Chat'}`}
          alt={chat.name}
          className="w-12 h-12 rounded-2xl object-cover bg-slate-800 border border-slate-700/60 shadow-xs"
        />
        {chat.type === 'DIRECT' ? (
          isOtherUserOnline && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0f1422] rounded-full shadow-xs"></span>
          )
        ) : (
          <span className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400">
            <Users className="w-2.5 h-2.5" />
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className={`text-sm font-semibold truncate ${isSelected ? 'text-indigo-300 font-bold' : 'text-slate-100'}`}>
            {chat.name}
          </h3>
          <span className={`text-[11px] shrink-0 font-medium ${chat.unreadCount > 0 ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}>
            {formatTime(chat.lastMessage?.createdAt || chat.updatedAt)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="truncate pr-1">{renderLastMessage()}</div>
          {chat.unreadCount > 0 && (
            <span className="shrink-0 min-w-5 h-5 px-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-md shadow-indigo-500/30">
              {chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
