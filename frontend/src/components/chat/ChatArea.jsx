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
import { Lock, MessageSquare, PhoneCall, Radio, Video, Users } from 'lucide-react';

export const ChatArea = ({
  chat,
  onGroupUpdated,
  onNewMessageReceived,
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

    // 2. Subscribe to message status updates (e.g. read receipts / blue ticks)
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

  // If no chat selected, display WhatsApp Web welcome splash
  if (!chat) {
    return (
      <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-[#222e35] p-8 text-center border-b-[6px] border-[#00a884]">
        <div className="max-w-md flex flex-col items-center">
          <div className="w-20 h-20 bg-[#202c33] rounded-full flex items-center justify-center mb-6 shadow-inner text-[#00a884]">
            <MessageSquare className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-light text-[#e9edef] mb-3 tracking-tight">
            WhatsApp Web
          </h1>
          <p className="text-sm text-[#8696a0] leading-relaxed mb-8">
            Send and receive live messages, create groups, share high-definition photos and videos, and make HD audio & video calls seamlessly.
          </p>

          <div className="flex items-center gap-2 text-xs text-[#8696a0] bg-[#111b21]/60 px-4 py-2 rounded-full border border-white/5">
            <Lock className="w-3.5 h-3.5 text-[#00a884]" />
            End-to-end encrypted real-time communication
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b141a] overflow-hidden relative">
      {/* Chat Header */}
      <ChatHeader
        chat={chat}
        currentUserId={user?.id}
        typingUsers={typingUsers}
        onOpenGroupInfo={() => setIsGroupInfoOpen(false)}
      />

      {/* Ongoing Group Call Alert Banner */}
      {activeCallInGroup && (
        <div className="bg-[#182229] border-b border-[#00a884]/30 px-4 py-2.5 flex items-center justify-between shadow-md z-10 animate-in slide-in-from-top-2 select-none">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#00a884]/20 border border-[#00a884]/50 flex items-center justify-center text-[#00a884] shrink-0 animate-pulse">
              {activeCallInGroup.callType === 'VIDEO' ? (
                <Video className="w-4 h-4" />
              ) : (
                <PhoneCall className="w-4 h-4" />
              )}
            </div>

            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#e9edef] truncate">
                  Ongoing Group {activeCallInGroup.callType === 'VIDEO' ? 'Video' : 'Voice'} Call
                </span>
                <span className="w-2 h-2 rounded-full bg-[#00a884] animate-ping shrink-0"></span>
              </div>
              <p className="text-[11px] text-[#8696a0] truncate">
                Started by <span className="text-[#00a884] font-medium">{activeCallInGroup.callerName}</span> • {activeCallInGroup.participants?.length || 1} joined
              </p>
            </div>
          </div>

          <div className="shrink-0 ml-3">
            {isAlreadyInThisCall ? (
              <span className="px-3 py-1 bg-[#00a884]/15 border border-[#00a884]/40 text-[#00a884] text-xs font-medium rounded-xl flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00a884]"></span>
                In Call
              </span>
            ) : (
              <button
                type="button"
                onClick={() => joinActiveGroupCall(chat.id, activeCallInGroup)}
                className="px-3.5 py-1.5 bg-[#00a884] hover:bg-[#00a884]/90 text-[#111b21] text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Join Call</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Message History List */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-xs text-[#8696a0]">
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
