import React, { useState, useRef } from 'react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { 
  Smile, 
  Paperclip, 
  Send, 
  Mic, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  FileText, 
  X, 
  Loader2 
} from 'lucide-react';
import { chatService } from '../../services/chatService';

export const MessageInput = ({ onSendMessage, onTyping }) => {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Handle typing debounce
  const handleTextChange = (e) => {
    setText(e.target.value);

    if (onTyping) {
      onTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 2000);
    }
  };

  const handleEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  // Handle file select
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setShowAttachMenu(false);

    try {
      const uploaded = await chatService.uploadFile(file);
      setPreviewAttachment(uploaded);
    } catch (err) {
      console.error('File upload failed', err);
      alert('Failed to upload file. Maximum allowed size is 100MB.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Voice note recorder
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `voice-note-${Date.now()}.webm`, { type: 'audio/webm' });
        
        setIsUploading(true);
        try {
          const uploaded = await chatService.uploadFile(audioFile);
          onSendMessage({
            content: '',
            type: 'AUDIO',
            attachments: [uploaded],
          });
        } catch (err) {
          console.error('Voice note upload error', err);
        } finally {
          setIsUploading(false);
        }

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to record audio', err);
      alert('Microphone access denied.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
    }
  };

  // Send message
  const handleSend = () => {
    if ((!text.trim() && !previewAttachment) || isUploading) return;

    let messageType = 'TEXT';
    let attachments = [];

    if (previewAttachment) {
      attachments = [previewAttachment];
      if (previewAttachment.fileType?.startsWith('image/')) messageType = 'IMAGE';
      else if (previewAttachment.fileType?.startsWith('video/')) messageType = 'VIDEO';
      else if (previewAttachment.fileType?.startsWith('audio/')) messageType = 'AUDIO';
      else messageType = 'FILE';
    }

    onSendMessage({
      content: text.trim(),
      type: messageType,
      attachments,
    });

    setText('');
    setPreviewAttachment(null);
    setShowEmojiPicker(false);
    if (onTyping) onTyping(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-[#0f1422] px-5 py-3 relative border-t border-slate-800/80">
      {/* File Preview before sending */}
      {previewAttachment && (
        <div className="mb-3 p-3 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3.5 min-w-0">
            {previewAttachment.fileType?.startsWith('image/') ? (
              <img
                src={previewAttachment.fileUrl}
                alt="preview"
                className="w-14 h-14 object-cover rounded-xl border border-white/10"
              />
            ) : previewAttachment.fileType?.startsWith('video/') ? (
              <div className="w-14 h-14 bg-violet-500/20 rounded-xl flex items-center justify-center text-violet-400">
                <VideoIcon className="w-6 h-6" />
              </div>
            ) : (
              <div className="w-14 h-14 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                <FileText className="w-6 h-6" />
              </div>
            )}
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-100 truncate">
                {previewAttachment.fileName}
              </p>
              <p className="text-[11px] text-slate-400">Ready to send • Add a caption below</p>
            </div>
          </div>
          <button
            onClick={() => setPreviewAttachment(null)}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Emoji Picker Popup */}
      {showEmojiPicker && (
        <div className="absolute bottom-18 left-5 z-50 shadow-2xl rounded-2xl overflow-hidden border border-slate-800">
          <EmojiPicker
            theme={Theme.DARK}
            onEmojiClick={handleEmojiClick}
            lazyLoadEmojis={true}
            searchDisabled={false}
            width={340}
            height={390}
          />
        </div>
      )}

      {/* Attachment Menu Popup */}
      {showAttachMenu && (
        <div className="absolute bottom-18 left-14 bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-2xl flex flex-col gap-1 z-50 animate-in fade-in slide-in-from-bottom-2">
          <label className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-slate-800 cursor-pointer transition text-slate-200 text-xs font-medium">
            <ImageIcon className="w-4 h-4 text-indigo-400" />
            Photos & Videos
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>
          <label className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-slate-800 cursor-pointer transition text-slate-200 text-xs font-medium">
            <FileText className="w-4 h-4 text-cyan-400" />
            Document
            <input
              type="file"
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>
        </div>
      )}

      {/* Voice Recording Bar */}
      {isRecording ? (
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900/95 rounded-2xl border border-rose-500/30 shadow-lg shadow-rose-950/20">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 bg-rose-500 rounded-full animate-ping"></span>
            <span className="text-xs text-rose-400 font-semibold">
              Recording audio: {Math.floor(recordingDuration / 60)}:
              {('0' + (recordingDuration % 60)).slice(-2)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={cancelRecording}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={stopRecording}
              className="p-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl transition cursor-pointer shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Regular Input Bar */
        <div className="flex items-center gap-2.5">
          {/* Emoji toggle */}
          <button
            type="button"
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowAttachMenu(false);
            }}
            className={`p-2.5 rounded-xl transition cursor-pointer ${
              showEmojiPicker ? 'text-indigo-400 bg-slate-800' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Attachment toggle */}
          <button
            type="button"
            onClick={() => {
              setShowAttachMenu(!showAttachMenu);
              setShowEmojiPicker(false);
            }}
            className={`p-2.5 rounded-xl transition cursor-pointer ${
              showAttachMenu ? 'text-indigo-400 bg-slate-800' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Input field */}
          <div className="flex-1 bg-slate-900/90 border border-slate-750 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 rounded-2xl px-4 py-2.5 transition">
            <input
              type="text"
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder={previewAttachment ? 'Add a caption...' : 'Type a message...'}
              className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none"
            />
          </div>

          {/* Send or Mic button */}
          {text.trim() || previewAttachment ? (
            <button
              onClick={handleSend}
              disabled={isUploading}
              className="p-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white rounded-2xl transition shadow-lg shadow-indigo-600/30 cursor-pointer flex items-center justify-center"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4 ml-0.5" />
              )}
            </button>
          ) : (
            <button
              onClick={startRecording}
              title="Record voice note"
              className="p-2.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition cursor-pointer"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
