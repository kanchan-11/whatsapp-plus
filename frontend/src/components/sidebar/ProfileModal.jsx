import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { chatService } from '../../services/chatService';
import { CameraCaptureModal } from '../media/CameraCaptureModal';
import { 
  User, 
  X, 
  Check, 
  Loader2, 
  Image as ImageIcon, 
  Camera, 
  Plus,
  ChevronDown
} from 'lucide-react';

export const ProfileModal = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [statusBio, setStatusBio] = useState(user?.statusBio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAddPhotoDropdownOpen, setIsAddPhotoDropdownOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsAddPhotoDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Modern Avatar Icon Presets
  const avatarIcons = [
    { label: 'Robot 1', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Felix' },
    { label: 'Robot 2', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Shadow' },
    { label: 'Avatar 1', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Coco' },
    { label: 'Avatar 2', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Precious' },
    { label: 'Adventurer 1', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Gizmo' },
    { label: 'Adventurer 2', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Garfield' },
    { label: 'Modern 1', url: 'https://api.dicebear.com/7.x/micah/svg?seed=Zoe' },
    { label: 'Modern 2', url: 'https://api.dicebear.com/7.x/micah/svg?seed=Jack' },
    { label: 'Persona 1', url: 'https://api.dicebear.com/7.x/open-peeps/svg?seed=Sam' },
    { label: 'Persona 2', url: 'https://api.dicebear.com/7.x/open-peeps/svg?seed=Avery' },
  ];

  if (!isOpen || !user) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setIsAddPhotoDropdownOpen(false);
    try {
      const res = await chatService.uploadFile(file);
      setAvatarUrl(res.fileUrl);
    } catch (err) {
      console.warn('File upload fallback:', err);
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setAvatarUrl(ev.target.result);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCameraCapture = (dataUrl) => {
    setAvatarUrl(dataUrl);
    setIsAddPhotoDropdownOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateProfile({
        displayName: displayName.trim(),
        statusBio: statusBio.trim(),
        avatarUrl: avatarUrl.trim(),
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 800);
    } catch (err) {
      console.error('Failed to update profile', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="w-full max-w-md bg-[#111b21] border border-[#222e35] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#202c33] flex items-center justify-between border-b border-[#222e35]">
          <h2 className="text-base font-semibold text-[#e9edef] flex items-center gap-2">
            <User className="w-5 h-5 text-[#00a884]" />
            Profile Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8696a0] hover:text-[#e9edef] hover:bg-[#111b21]/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Avatar preview */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#202c33] shadow-lg bg-[#202c33] flex items-center justify-center ring-2 ring-[#00a884]/40">
                {isUploading ? (
                  <Loader2 className="w-8 h-8 animate-spin text-[#00a884]" />
                ) : (
                  <img
                    src={avatarUrl || user.avatarUrl || avatarIcons[0].url}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
            <p className="text-xs text-[#8696a0] mt-1.5 font-medium">@{user.username}</p>
          </div>

          {/* Avatar Presets with Single Add Photo dropdown */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-medium text-[#8696a0] uppercase tracking-wider">
                Choose Avatar Icon
              </label>

              {/* Single Add Photo Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => setIsAddPhotoDropdownOpen((prev) => !prev)}
                  className="py-1 px-2.5 bg-[#202c33] hover:bg-[#2a3942] border border-[#374248] rounded-lg text-[#00a884] text-xs font-medium transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Photo</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isAddPhotoDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isAddPhotoDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-44 bg-[#202c33] border border-[#374248] rounded-xl shadow-xl py-1 z-30 animate-in fade-in zoom-in-95">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddPhotoDropdownOpen(false);
                        fileInputRef.current?.click();
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-[#e9edef] hover:bg-[#111b21] flex items-center gap-2.5 transition cursor-pointer"
                    >
                      <ImageIcon className="w-4 h-4 text-[#00a884]" />
                      <span>Choose from Gallery</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddPhotoDropdownOpen(false);
                        setIsCameraOpen(true);
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-[#e9edef] hover:bg-[#111b21] flex items-center gap-2.5 transition cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-[#00a884]" />
                      <span>Take with Camera</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Horizontal list with adequate vertical padding to prevent hover crop */}
            <div className="py-2.5 px-1 overflow-x-auto overflow-y-visible no-scrollbar">
              <div className="flex items-center gap-2.5 min-w-max">
                {avatarIcons.map((item, idx) => {
                  const isSelected = (avatarUrl || user.avatarUrl) === item.url;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(item.url)}
                      className={`relative w-10 h-10 rounded-full shrink-0 bg-[#202c33] border-2 transition-all duration-150 transform hover:scale-110 cursor-pointer overflow-hidden p-0.5 ${
                        isSelected
                          ? 'border-[#00a884] scale-110 shadow-lg ring-2 ring-[#00a884]/50'
                          : 'border-transparent opacity-75 hover:opacity-100 hover:border-[#374248]'
                      }`}
                      title={item.label}
                    >
                      <img
                        src={item.url}
                        alt={item.label}
                        className="w-full h-full object-cover rounded-full pointer-events-none"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#00a884]/20 flex items-center justify-center rounded-full">
                          <Check className="w-3 h-3 text-[#00a884] stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8696a0] uppercase tracking-wider mb-1.5">
              Your Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Display Name"
              className="w-full px-3.5 py-2.5 bg-[#202c33] border border-transparent focus:border-[#00a884] rounded-xl text-sm text-[#e9edef] placeholder-[#8696a0] outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8696a0] uppercase tracking-wider mb-1.5">
              About / Status Bio
            </label>
            <input
              type="text"
              value={statusBio}
              onChange={(e) => setStatusBio(e.target.value)}
              placeholder="Hey there! I am using WhatsApp."
              className="w-full px-3.5 py-2.5 bg-[#202c33] border border-transparent focus:border-[#00a884] rounded-xl text-sm text-[#e9edef] placeholder-[#8696a0] outline-none transition"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#8696a0] hover:text-[#e9edef] hover:bg-[#202c33] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="px-5 py-2.5 bg-[#00a884] hover:bg-[#00a884]/90 disabled:opacity-50 text-[#111b21] font-semibold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer shadow-md"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : success ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
};
