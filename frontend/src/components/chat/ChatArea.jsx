import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useCall } from '../../context/CallContext';
import { chatService } from '../../services/chatService';
import { soundService } from '../../services/soundService';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { MediaLightbox } from '../media/MediaLightbox';
import { GroupInfoModal } from '../sidebar/GroupInfoModal';
import { InstantPingLogo } from '../common/InstantPingLogo';
import { Lock, MessageSquare, PhoneCall, Radio, Video, Zap, ShieldCheck } from 'lucide-react';

export const ChatArea = ({
  chat,
  onGroupUpdated,
  onNewMessageReceived,
  onBack,
}) => {
  const { user } = useAuth();
  const { subscribe, sendTyping } = useSocket();
  const { activeGroupCalls, joinActiveGroupCall, isGroupCall, groupInfo } = useCall();

  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [activeMedia, setActiveMedia] = useState(null);
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);

  const activeCallInGroup = chat?.type === 'GROUP' ? activeGroupCalls[chat.id] : null;
  const isAlreadyInThisCall = isGroupCall && groupInfo?.id === chat?.id;

  // Load message history when active chat changes
  useEffect(() => {
    if (!chat?.id) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const list = await chatService.getMessages(chat.id);
        setMessages(list);
        await chatService.markAsRead(chat.id);
      } catch (err) {
        console.error('Failed to fetch messages', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
    setTypingUsers([]);
  }, [chat?.id]);

  // Subscribe to real-time chat updates via WebSocket
  useEffect(() => {
    if (!chat?.id || !subscribe) return;

    // 1. Subscribe to new messages
    const messageSub = subscribe(`/topic/chat.${chat.id}`, async (msgFrame) => {
      try {
        const newMsg = JSON.parse(msgFrame.body);
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });

        if (onNewMessageReceived) {
          onNewMessageReceived(chat.id, newMsg);
        }

        if (newMsg.sender?.id !== user?.id) {
          soundService.playMessageTone();
          chatService.markAsRead(chat.id);
        }
      } catch (err) {
        console.error('Failed to parse incoming message', err);
      }
    });

    // 2. Subscribe to message status updates
    const statusSub = subscribe(`/topic/chat.${chat.id}.status`, (statusFrame) => {
      try {
        const update = JSON.parse(statusFrame.body);
        if (update.status === 'READ') {
          setMessages((prev) =>
            prev.map((m) => {
              if (update.messageIds && update.messageIds.includes(m.id)) {
                return { ...m, status: 'READ' };
              }
              if (m.sender?.id === user?.id) {
                return { ...m, status: 'READ' };
              }
              return m;
            })
          );
        }
      } catch (err) {
        console.error('Failed to parse status update', err);
      }
    });

    // 3. Subscribe to typing indicator
    const typingSub = subscribe(`/topic/chat.${chat.id}.typing`, (typingFrame) => {
      try {
        const notification = JSON.parse(typingFrame.body);
        if (notification.userId !== user?.id) {
          if (notification.typing) {
            setTypingUsers((prev) => {
              if (prev.some((u) => u.userId === notification.userId)) return prev;
              return [...prev, notification];
            });
          } else {
            setTypingUsers((prev) => prev.filter((u) => u.userId !== notification.userId));
          }
        }
      } catch (err) {
        console.error('Failed to parse typing event', err);
      }
    });

    return () => {
      messageSub.unsubscribe();
      statusSub.unsubscribe();
      typingSub.unsubscribe();
    };
  }, [chat?.id, subscribe, user?.id, onNewMessageReceived]);

  const handleSendMessage = async (msgData) => {
    try {
      await chatService.sendMessage({
        chatId: chat.id,
        content: msgData.content,
        type: msgData.type,
        attachments: msgData.attachments,
      });
    } catch (err) {
      console.error('Failed to send message', err);
      alert('Could not send message. Please try again.');
    }
  };

  const handleTyping = (isTyping) => {
    if (chat?.id) {
      sendTyping(chat.id, isTyping);
    }
  };

  // If no chat selected, display modern app welcome splash (hidden on mobile)
  if (!chat) {
    return (
      <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-[#0a0e17] chat-bg p-8 text-center select-none relative">
        <div className="max-w-md flex flex-col items-center">
          <div className="mb-6">
            <InstantPingLogo className="w-20 h-20" />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-3 tracking-tight">
            Welcome to InstantPing
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed mb-8">
            Ultra-fast real-time messaging, multi-user HD voice and video rooms, voice notes, and end-to-end encrypted conversations.
          </p>

          <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/80 px-4 py-2.5 rounded-full border border-slate-800 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>End-to-end encrypted real-time communication</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0e17] chat-bg overflow-hidden relative w-full">
      {/* Chat Header */}
      <ChatHeader
        chat={chat}
        currentUserId={user?.id}
        typingUsers={typingUsers}
        onOpenGroupInfo={() => setIsGroupInfoOpen(true)}
        onBack={onBack}
      />

      {/* Ongoing Group Call Alert Banner */}
      {activeCallInGroup && (
        <div className="bg-gradient-to-r from-indigo-950/90 via-slate-900/95 to-violet-950/90 border-b border-indigo-500/30 px-3 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between shadow-lg z-10 animate-in slide-in-from-top-2 select-none backdrop-blur-md">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-500/30 animate-pulse">
              {activeCallInGroup.callType === 'VIDEO' ? (
                <Video className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              ) : (
                <PhoneCall className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              )}
            </div>

            <div className="truncate">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xs font-bold text-white truncate">
                  Group {activeCallInGroup.callType === 'VIDEO' ? 'Video' : 'Voice'} Call
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0"></span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                Started by <span className="text-indigo-300 font-medium">{activeCallInGroup.callerName}</span> • {activeCallInGroup.participants?.length || 1} connected
              </p>
            </div>
          </div>

          <div className="shrink-0 ml-2 sm:ml-3">
            {isAlreadyInThisCall ? (
              <span className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[11px] sm:text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                In Call
              </span>
            ) : (
              <button
                type="button"
                onClick={() => joinActiveGroupCall(chat.id, activeCallInGroup)}
                className="px-3 sm:px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-[11px] sm:text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Join</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Message History List */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
          Loading messages...
        </div>
      ) : (
        <MessageList
          messages={messages}
          currentUserId={user?.id}
          isGroup={chat.type === 'GROUP'}
          onOpenMedia={(media) => setActiveMedia(media)}
        />
      )}

      {/* Input Field & Media Upload */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
      />

      {/* Fullscreen Lightbox */}
      <MediaLightbox
        media={activeMedia}
        onClose={() => setActiveMedia(null)}
      />

      {/* Group Info Modal */}
      <GroupInfoModal
        isOpen={isGroupInfoOpen}
        onClose={() => setIsGroupInfoOpen(false)}
        chat={chat}
        onGroupUpdated={onGroupUpdated}
      />
    </div>
  );
};
