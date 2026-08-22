import React from 'react';
import { X, Download } from 'lucide-react';

export const MediaLightbox = ({ media, onClose }) => {
  if (!media) return null;

  const isVideo = media.fileType?.startsWith('video') || media.type === 'VIDEO';

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in select-none">
      {/* Top bar controls */}
      <div className="absolute top-5 right-5 flex items-center gap-2.5 z-10">
        <a
          href={media.fileUrl}
          download={media.fileName || 'media'}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 bg-slate-900/80 hover:bg-slate-800 rounded-2xl text-slate-200 hover:text-white transition cursor-pointer border border-slate-750 shadow-xl"
          title="Download"
        >
          <Download className="w-5 h-5" />
        </a>
        <button
          onClick={onClose}
          className="p-3 bg-slate-900/80 hover:bg-slate-800 rounded-2xl text-slate-200 hover:text-white transition cursor-pointer border border-slate-750 shadow-xl"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Media Content */}
      <div className="max-w-5xl max-h-[85vh] flex items-center justify-center">
        {isVideo ? (
          <video
            src={media.fileUrl}
            controls
            autoPlay
            className="max-w-full max-h-[85vh] rounded-3xl shadow-2xl border border-white/10"
          />
        ) : (
          <img
            src={media.fileUrl}
            alt={media.fileName || 'Preview'}
            className="max-w-full max-h-[85vh] object-contain rounded-3xl shadow-2xl border border-white/10"
          />
        )}
      </div>
    </div>
  );
};
