import React from 'react';
import { format } from 'date-fns';
import { Check, CheckCheck, FileText, Download, Play, Image as ImageIcon } from 'lucide-react';

export const MessageBubble = ({ message, currentUserId, isGroup, onOpenMedia }) => {
  const isMe = message.sender?.id === currentUserId;

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      return format(new Date(dateStr), 'h:mm a');
    } catch {
      return '';
    }
  };

  // Deterministic user color for group messages
  const getUserColor = (id) => {
    const colors = [
      'text-cyan-400',
      'text-amber-400',
      'text-emerald-400',
      'text-fuchsia-400',
      'text-indigo-400',
      'text-rose-400',
    ];
    return colors[(id || 0) % colors.length];
  };

  return (
    <div className={`flex flex-col mb-1.5 ${isMe ? 'items-end' : 'items-start'}`}>
      <div
        className={`relative max-w-[85%] md:max-w-[65%] rounded-2xl px-4 py-2.5 shadow-sm transition ${
          isMe
            ? 'bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 text-white rounded-tr-xs shadow-indigo-950/40 border border-indigo-500/30'
            : 'bg-[#161d2d] border border-slate-800 text-slate-100 rounded-tl-xs shadow-slate-950/30'
        }`}
      >
        {/* Group Sender Name */}
        {isGroup && !isMe && message.sender && (
          <p className={`text-xs font-bold mb-1 tracking-wide ${getUserColor(message.sender.id)}`}>
            {message.sender.displayName || message.sender.username}
          </p>
        )}

        {/* Media Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="space-y-2 mb-2">
            {message.attachments.map((att, idx) => {
              const isImage = att.fileType?.startsWith('image/') || message.type === 'IMAGE';
              const isVideo = att.fileType?.startsWith('video/') || message.type === 'VIDEO';
              const isAudio = att.fileType?.startsWith('audio/') || message.type === 'AUDIO';

              if (isImage) {
                return (
                  <div
                    key={idx}
                    onClick={() => onOpenMedia && onOpenMedia(att)}
                    className="cursor-pointer overflow-hidden rounded-xl bg-black/20 hover:opacity-95 transition border border-white/10"
                  >
                    <img
                      src={att.fileUrl}
                      alt={att.fileName}
                      className="max-h-72 w-full object-cover rounded-xl"
                      loading="lazy"
                    />
                  </div>
                );
              }

              if (isVideo) {
                return (
                  <div key={idx} className="rounded-xl overflow-hidden bg-black/40 border border-white/10">
                    <video
                      src={att.fileUrl}
                      controls
                      className="max-h-72 w-full rounded-xl"
                    />
                  </div>
                );
              }

              if (isAudio) {
                return (
                  <div key={idx} className="py-1 min-w-[240px]">
                    <audio src={att.fileUrl} controls className="w-full h-8" />
                  </div>
                );
              }

              // Document or other file type
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-black/20 rounded-xl border border-white/10"
                >
                  <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{att.fileName}</p>
                    <p className="text-[10px] text-slate-400">
                      {att.fileSize ? `${(att.fileSize / 1024).toFixed(1)} KB` : 'Document'}
                    </p>
                  </div>
                  <a
                    href={att.fileUrl}
                    download={att.fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              );
            })}
          </div>
        )}

        {/* Message Text Content */}
        {message.content && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words pr-14 text-slate-100">
            {message.content}
          </p>
        )}

        {/* Timestamp & Status ticks */}
        <div className={`float-right -mt-2 -mr-1 ml-3 flex items-center gap-1 text-[11px] ${isMe ? 'text-indigo-200/80' : 'text-slate-400'}`}>
          <span>{formatTime(message.createdAt)}</span>
          {isMe && (
            <span className="inline-flex items-center ml-0.5">
              {message.status === 'READ' ? (
                <CheckCheck className="w-3.5 h-3.5 text-cyan-300" />
              ) : message.status === 'DELIVERED' ? (
                <CheckCheck className="w-3.5 h-3.5 text-indigo-200" />
              ) : (
                <Check className="w-3.5 h-3.5 text-indigo-200" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
