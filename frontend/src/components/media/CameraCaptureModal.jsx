import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Check, X, AlertCircle } from 'lucide-react';

export const CameraCaptureModal = ({ isOpen, onClose, onCapture }) => {
  const [stream, setStream] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError] = useState('');
  const videoRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setPhotoPreview(null);
      setError('');
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setError('');
    setPhotoPreview(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 640 }, facingMode: 'user' },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Unable to access camera. Please allow camera permissions in your browser.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const size = Math.min(video.videoWidth, video.videoHeight) || 400;
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    // Crop center square
    const startX = (video.videoWidth - size) / 2;
    const startY = (video.videoHeight - size) / 2;
    ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setPhotoPreview(dataUrl);
    stopCamera();
  };

  const handleRetake = () => {
    startCamera();
  };

  const handleConfirm = () => {
    if (photoPreview) {
      onCapture(photoPreview);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-60 animate-in fade-in">
      <div className="w-full max-w-sm bg-[#111b21] border border-[#222e35] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#202c33] flex items-center justify-between border-b border-[#222e35]">
          <h3 className="text-sm font-semibold text-[#e9edef] flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#00a884]" />
            Take Profile Photo
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#8696a0] hover:text-[#e9edef] hover:bg-[#111b21]/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Preview */}
        <div className="p-6 flex flex-col items-center justify-center bg-[#0c1317]">
          {error ? (
            <div className="text-center p-6 text-red-400 text-xs flex flex-col items-center gap-2">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <p>{error}</p>
            </div>
          ) : photoPreview ? (
            <div className="relative w-56 h-56 rounded-full overflow-hidden border-4 border-[#00a884] shadow-xl">
              <img src={photoPreview} alt="Captured" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="relative w-56 h-56 rounded-full overflow-hidden border-4 border-[#222e35] shadow-xl bg-black flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover -scale-x-100"
              />
              <div className="absolute inset-0 pointer-events-none border border-white/20 rounded-full"></div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 bg-[#202c33] border-t border-[#222e35] flex items-center justify-between gap-3">
          {photoPreview ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 py-2.5 px-4 bg-[#111b21] hover:bg-[#2a3942] text-[#e9edef] text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer border border-[#374248]"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retake
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 py-2.5 px-4 bg-[#00a884] hover:bg-[#00a884]/90 text-[#111b21] text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Check className="w-4 h-4" /> Use Photo
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 text-xs text-[#8696a0] hover:text-[#e9edef] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!!error}
                onClick={capturePhoto}
                className="flex-1 py-2.5 px-4 bg-[#00a884] hover:bg-[#00a884]/90 disabled:opacity-50 text-[#111b21] text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Camera className="w-4 h-4" /> Capture Photo
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
