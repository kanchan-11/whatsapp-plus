import React, { useEffect, useRef } from 'react';
import { isSameDay, format } from 'date-fns';
import { MessageBubble } from './MessageBubble';

export const MessageList = ({ messages, currentUserId, isGroup, onOpenMedia, onToggleReaction, onReply }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Format date divider label
  const getDateLabel = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (isSameDay(date, today)) return 'TODAY';
    if (isSameDay(date, yesterday)) return 'YESTERDAY';
    return format(date, 'MMMM d, yyyy');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:px-12 space-y-2 chat-bg">
      {messages.map((msg, index) => {
        const prevMsg = messages[index - 1];
        const isFirstOfDay = !prevMsg || !isSameDay(new Date(msg.createdAt), new Date(prevMsg.createdAt));

        return (
          <React.Fragment key={msg.id || index}>
            {isFirstOfDay && (
              <div className="flex justify-center my-4">
                <span className="px-3 py-1 bg-[#182229] border border-[#222e35] text-[#8696a0] text-[11px] font-semibold rounded-lg uppercase tracking-wider shadow-xs">
                  {getDateLabel(msg.createdAt)}
                </span>
              </div>
            )}
            <MessageBubble
              message={msg}
              currentUserId={currentUserId}
              isGroup={isGroup}
              onOpenMedia={onOpenMedia}
              onToggleReaction={onToggleReaction}
              onReply={onReply}
            />
          </React.Fragment>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};
