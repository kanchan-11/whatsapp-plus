import React from 'react';
import { X, Download } from 'lucide-react';

export const MediaLightbox = ({ media, onClose }) => {
  if (!media) return null;

  const isVideo = media.fileType?.startsWith('video') || media.type === 'VIDEO';

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
      {/* Top bar controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <a
          href={media.fileUrl}
          download={media.fileName || 'media'}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 bg-[#202c33]/80 hover:bg-[#374248] rounded-full text-[#e9edef] transition cursor-pointer"
          title="Download"
        >
          <Download className="w-5 h-5" />
        </a>
        <button
          onClick={onClose}
          className="p-2.5 bg-[#202c33]/80 hover:bg-[#374248] rounded-full text-[#e9edef] transition cursor-pointer"
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
            className="max-w-full max-h-[85vh] rounded-xl shadow-2xl"
          />
        ) : (
          <img
            src={media.fileUrl}
            alt={media.fileName || 'Preview'}
            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
          />
        )}
      </div>
    </div>
  );
};
