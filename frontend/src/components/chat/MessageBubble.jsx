import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Check, 
  CheckCheck, 
  FileText, 
  Download, 
  Play, 
  Pause, 
  Mic
} from 'lucide-react';

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
    </div>
  );
};
