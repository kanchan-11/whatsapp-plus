import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { 
  Smile, 
  Paperclip, 
  Send, 
  Mic, 
  Square, 
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
    <div className="bg-[#202c33] px-4 py-2.5 relative border-t border-[#222e35]">
      {/* File Preview before sending */}
      {previewAttachment && (
        <div className="mb-3 p-3 bg-[#111b21] rounded-2xl border border-[#222e35] flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {previewAttachment.fileType?.startsWith('image/') ? (
              <img
                src={previewAttachment.fileUrl}
                alt="preview"
                className="w-14 h-14 object-cover rounded-xl border border-white/10"
              />
            ) : previewAttachment.fileType?.startsWith('video/') ? (
              <div className="w-14 h-14 bg-black/40 rounded-xl flex items-center justify-center text-[#00a884]">
                <VideoIcon className="w-6 h-6" />
              </div>
            ) : (
              <div className="w-14 h-14 bg-[#00a884]/20 rounded-xl flex items-center justify-center text-[#00a884]">
                <FileText className="w-6 h-6" />
              </div>
            )}
            <div className="truncate">
              <p className="text-xs font-semibold text-[#e9edef] truncate">
                {previewAttachment.fileName}
              </p>
              <p className="text-[11px] text-[#8696a0]">Ready to send • Add a caption below</p>
            </div>
          </div>
          <button
            onClick={() => setPreviewAttachment(null)}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#8696a0] hover:text-[#e9edef] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Emoji Picker Popup */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 left-4 z-50 shadow-2xl rounded-2xl overflow-hidden border border-[#222e35]">
          <EmojiPicker
            theme={Theme.DARK}
            onEmojiClick={handleEmojiClick}
            lazyLoadEmojis={true}
            searchDisabled={false}
            width={340}
            height={400}
          />
        </div>
      )}

      {/* Attachment Menu Popup */}
      {showAttachMenu && (
        <div className="absolute bottom-16 left-12 bg-[#202c33] border border-[#222e35] rounded-2xl p-2 shadow-2xl flex flex-col gap-1 z-50 animate-in fade-in slide-in-from-bottom-2">
          <label className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#111b21] cursor-pointer transition text-[#e9edef] text-xs font-medium">
            <ImageIcon className="w-4 h-4 text-[#00a884]" />
            Photos & Videos
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>
          <label className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#111b21] cursor-pointer transition text-[#e9edef] text-xs font-medium">
            <FileText className="w-4 h-4 text-[#53bdeb]" />
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
        <div className="flex items-center justify-between px-3 py-1 bg-[#111b21] rounded-2xl border border-[#222e35]">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
            <span className="text-xs text-red-400 font-medium">
              Recording audio: {Math.floor(recordingDuration / 60)}:
              {('0' + (recordingDuration % 60)).slice(-2)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={cancelRecording}
              className="px-3 py-1.5 text-xs text-[#8696a0] hover:text-[#e9edef] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={stopRecording}
              className="p-2 bg-[#00a884] hover:bg-[#00a884]/90 text-[#111b21] rounded-full transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Regular Input Bar */
        <div className="flex items-center gap-2">
          {/* Emoji toggle */}
          <button
            type="button"
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowAttachMenu(false);
            }}
            className={`p-2 rounded-full transition cursor-pointer ${
              showEmojiPicker ? 'text-[#00a884] bg-[#111b21]' : 'text-[#8696a0] hover:text-[#e9edef]'
            }`}
          >
            <Smile className="w-6 h-6" />
          </button>

          {/* Attachment toggle */}
          <button
            type="button"
            onClick={() => {
              setShowAttachMenu(!showAttachMenu);
              setShowEmojiPicker(false);
            }}
            className={`p-2 rounded-full transition cursor-pointer ${
              showAttachMenu ? 'text-[#00a884] bg-[#111b21]' : 'text-[#8696a0] hover:text-[#e9edef]'
            }`}
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Input field */}
          <div className="flex-1 bg-[#2a3942] rounded-xl px-4 py-2 focus-within:ring-1 focus-within:ring-[#00a884]">
            <input
              type="text"
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder={previewAttachment ? 'Add a caption...' : 'Type a message'}
              className="w-full bg-transparent text-sm text-[#e9edef] placeholder-[#8696a0] outline-none"
            />
          </div>

          {/* Send or Mic button */}
          {text.trim() || previewAttachment ? (
            <button
              onClick={handleSend}
              disabled={isUploading}
              className="p-2.5 bg-[#00a884] hover:bg-[#00a884]/90 disabled:opacity-50 text-[#111b21] rounded-full transition shadow-md cursor-pointer flex items-center justify-center"
            >
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5 ml-0.5" />
              )}
            </button>
          ) : (
            <button
              onClick={startRecording}
              title="Record voice note"
              className="p-2.5 rounded-full text-[#8696a0] hover:text-[#e9edef] hover:bg-[#374248] transition cursor-pointer"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
