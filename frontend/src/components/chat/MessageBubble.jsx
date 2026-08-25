import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Check, 
  CheckCheck, 
  FileText, 
  Download, 
  Play, 
  Pause, 
  Smile,
  Reply
} from 'lucide-react';

const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '🎉'];

const CustomAudioPlayer = ({ src, isMe }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Deterministic heights for waveform bars (24 bars)
  const waveformBars = [
    35, 60, 45, 80, 100, 70, 40, 65, 90, 50, 75, 95, 
    60, 40, 85, 95, 70, 50, 65, 90, 45, 75, 55, 30
  ];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch((err) => console.error(err));
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progress = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = progress * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const cyclePlaybackRate = (e) => {
    e.stopPropagation();
    const rates = [1, 1.5, 2];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const formatAudioTime = (seconds) => {
    if (!seconds || isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-3 py-1 px-1 min-w-[240px] sm:min-w-[280px] select-none">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Play / Pause Circular Button */}
      <button
        type="button"
        onClick={togglePlay}
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-md cursor-pointer ${
          isMe
            ? 'bg-white text-indigo-600 hover:bg-slate-100 shadow-indigo-950/30'
            : 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-400 hover:to-violet-400 shadow-indigo-950/40'
        }`}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 fill-current" />
        ) : (
          <Play className="w-4 h-4 fill-current ml-0.5" />
        )}
      </button>

      {/* Waveform & Scrubber Area */}
      <div className="flex-1 flex flex-col justify-center gap-1.5">
        <div
          onClick={handleSeek}
          className="flex items-center gap-[3px] h-6 cursor-pointer group py-1"
          title="Click to seek"
        >
          {waveformBars.map((height, i) => {
            const barProgress = (i / waveformBars.length) * 100;
            const isPlayed = progressPercent >= barProgress;

            return (
              <div
                key={i}
                style={{ height: `${height}%` }}
                className={`flex-1 min-w-[2.5px] rounded-full transition-colors duration-100 ${
                  isPlayed
                    ? isMe
                      ? 'bg-white'
                      : 'bg-indigo-400 shadow-xs'
                    : isMe
                      ? 'bg-indigo-300/40 group-hover:bg-indigo-300/60'
                      : 'bg-slate-700 group-hover:bg-slate-600'
                }`}
              />
            );
          })}
        </div>

        {/* Time and Speed Controls */}
        <div className="flex items-center justify-between text-[11px] font-medium leading-none">
          <span className={isMe ? 'text-indigo-100' : 'text-slate-400'}>
            {isPlaying ? formatAudioTime(currentTime) : formatAudioTime(duration || currentTime)}
          </span>

          <button
            type="button"
            onClick={cyclePlaybackRate}
            className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer ${
              isMe
                ? 'bg-indigo-700/50 hover:bg-indigo-700 text-indigo-100'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Change playback speed"
          >
            {playbackRate}x
          </button>
        </div>
      </div>
    </div>
  );
};

export const MessageBubble = ({ message, currentUserId, isGroup, onOpenMedia, onToggleReaction, onReply }) => {
  const isMe = message.sender?.id === currentUserId;
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

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

  const handleSelectEmoji = (emoji) => {
    setShowEmojiPicker(false);
    if (onToggleReaction && message?.id) {
      onToggleReaction(message.id, emoji);
    }
  };

  return (
    <div
      id={`msg-${message.id}`}
      className={`group/bubble flex flex-col mb-1.5 relative ${isMe ? 'items-end' : 'items-start'}`}
    >
      {/* Floating Action Bar on Hover */}
      <div
        className={`absolute top-0 -translate-y-1/2 opacity-0 group-hover/bubble:opacity-100 transition-opacity z-20 flex items-center gap-1.5 ${
          isMe ? 'right-2' : 'left-2'
        }`}
      >
        <button
          type="button"
          onClick={() => onReply && onReply(message)}
          className="p-1.5 rounded-full bg-slate-900/90 border border-slate-750 text-slate-300 hover:text-white hover:scale-110 shadow-lg cursor-pointer backdrop-blur-md transition"
          title="Reply to message"
        >
          <Reply className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className="p-1.5 rounded-full bg-slate-900/90 border border-slate-750 text-slate-300 hover:text-white hover:scale-110 shadow-lg cursor-pointer backdrop-blur-md transition"
          title="React to message"
        >
          <Smile className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Floating Quick Emoji Picker Popup */}
      {showEmojiPicker && (
        <div
          ref={pickerRef}
          className={`absolute -top-11 z-30 flex items-center gap-1.5 px-2 py-1.5 bg-[#0f172a]/95 border border-slate-700/80 rounded-full shadow-2xl backdrop-blur-xl animate-in zoom-in-95 ${
            isMe ? 'right-0' : 'left-0'
          }`}
        >
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleSelectEmoji(emoji)}
              className="w-8 h-8 flex items-center justify-center text-base rounded-full hover:bg-slate-800/90 hover:scale-125 active:scale-95 transition-all cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Message Bubble Container */}
      <div
        id={`msg-card-${message.id}`}
        className={`relative max-w-[85%] md:max-w-[65%] rounded-2xl px-4 py-2.5 shadow-sm transition-all duration-300 ${
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

        {/* Quoted Parent Message (Click to Jump) */}
        {message.replyTo && (
          <div
            onClick={() => {
              const card = document.getElementById(`msg-card-${message.replyTo.id}`);
              if (card) {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                card.classList.add('ring-4', 'ring-indigo-400/80', 'shadow-2xl', 'shadow-indigo-500/50', 'scale-[1.02]');
                setTimeout(() => {
                  card.classList.remove('ring-4', 'ring-indigo-400/80', 'shadow-2xl', 'shadow-indigo-500/50', 'scale-[1.02]');
                }, 1400);
              }
            }}
            className="mb-2 p-2 rounded-xl bg-black/25 border-l-4 border-indigo-400 cursor-pointer hover:bg-black/35 transition text-left select-none"
            title="Click to jump to original message"
          >
            <p className="text-[11px] font-bold text-indigo-300 truncate">
              {message.replyTo.senderName || 'Message'}
            </p>
            <p className="text-xs text-slate-300 truncate line-clamp-1">
              {message.replyTo.content || (message.replyTo.type === 'AUDIO' ? '🎵 Voice note' : '📷 Attachment')}
            </p>
          </div>
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
                  <CustomAudioPlayer
                    key={idx}
                    src={att.fileUrl}
                    isMe={isMe}
                  />
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

      {/* Reaction Badges Below Message */}
      {message.reactions && message.reactions.length > 0 && (
        <div className={`flex flex-wrap items-center gap-1.5 mt-1.5 pb-0.5 z-10 ${isMe ? 'justify-end pr-1' : 'justify-start pl-1'}`}>
          {message.reactions.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onToggleReaction && onToggleReaction(message.id, r.emoji)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition cursor-pointer hover:scale-105 active:scale-95 shadow-sm ${
                r.reactedByMe
                  ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 shadow-indigo-500/20'
                  : 'bg-slate-900/90 border-slate-750 text-slate-300 hover:bg-slate-800'
              }`}
              title={r.users?.map((u) => u.displayName || u.username).join(', ') || ''}
            >
              <span className="text-sm leading-none">{r.emoji}</span>
              <span className="text-[11px] font-bold leading-none">{r.count}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
