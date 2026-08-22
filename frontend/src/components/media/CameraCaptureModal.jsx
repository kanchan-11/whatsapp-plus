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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-60 animate-in fade-in select-none">
      <div className="w-full max-w-sm bg-[#0f1422] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col shadow-indigo-950/40">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900/80 flex items-center justify-between border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Camera className="w-4 h-4 text-indigo-400" />
            Take Profile Photo
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Preview */}
        <div className="p-6 flex flex-col items-center justify-center bg-[#0a0e17]">
          {error ? (
            <div className="text-center p-6 text-rose-400 text-xs flex flex-col items-center gap-2">
              <AlertCircle className="w-8 h-8 text-rose-400" />
              <p>{error}</p>
            </div>
          ) : photoPreview ? (
            <div className="relative w-56 h-56 rounded-3xl overflow-hidden border-4 border-indigo-500 shadow-xl ring-2 ring-indigo-500/30">
              <img src={photoPreview} alt="Captured" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="relative w-56 h-56 rounded-3xl overflow-hidden border-4 border-slate-750 shadow-xl bg-black flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover -scale-x-100"
              />
              <div className="absolute inset-0 pointer-events-none border border-white/10 rounded-3xl"></div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between gap-3">
          {photoPreview ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retake
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30"
              >
                <Check className="w-4 h-4" /> Use Photo
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!!error}
                onClick={capturePhoto}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white text-xs font-bold rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30"
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
