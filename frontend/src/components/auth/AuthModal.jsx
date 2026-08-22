import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { chatService } from '../../services/chatService';
import { CameraCaptureModal } from '../media/CameraCaptureModal';
import { 
  MessageSquare, 
  Lock, 
  User, 
  Mail, 
  Sparkles, 
  Loader2, 
  ArrowRight, 
  Zap, 
  Image as ImageIcon, 
  Camera, 
  Check, 
  Plus,
  ChevronDown
} from 'lucide-react';

export const AuthModal = () => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    displayName: '',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Felix',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAddPhotoDropdownOpen, setIsAddPhotoDropdownOpen] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
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

  const demoAccounts = [
    { username: 'user', name: 'Demo User', role: 'Main User' },
    { username: 'alice', name: 'Alice Walker', role: 'Peer Contact' },
    { username: 'bob', name: 'Bob Miller', role: 'Peer Contact' },
  ];

  const handleQuickLogin = async (username) => {
    setError('');
    setIsLoading(true);
    try {
      await login({
        usernameOrEmail: username,
        password: 'password123',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    setIsUploadingAvatar(true);
    setIsAddPhotoDropdownOpen(false);
    try {
      const res = await chatService.uploadFile(file);
      setFormData((prev) => ({ ...prev, avatarUrl: res.fileUrl }));
    } catch (err) {
      console.warn('Upload failed, falling back to local data URL:', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData((prev) => ({ ...prev, avatarUrl: event.target.result }));
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCameraCapture = (dataUrl) => {
    setFormData((prev) => ({ ...prev, avatarUrl: dataUrl }));
    setIsAddPhotoDropdownOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isRegister) {
        await register({
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
          displayName: formData.displayName.trim() || formData.username.trim(),
          avatarUrl: formData.avatarUrl || avatarIcons[0].url,
        });
      } else {
        await login({
          usernameOrEmail: formData.username.trim(),
          password: formData.password,
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.username ||
        err.response?.data?.errors?.email ||
        'Authentication failed. Please check your credentials.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0c1317] flex items-center justify-center p-4 z-50 overflow-y-auto">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#00a884] rounded-full filter blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#005c4b] rounded-full filter blur-3xl"></div>
      </div>

      <div className="w-full max-w-md bg-[#111b21] border border-[#222e35] rounded-2xl shadow-2xl p-7 relative z-10 my-6">
        {/* Logo Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#00a884]/15 border border-[#00a884]/30 rounded-2xl mb-2 text-[#00a884] shadow-inner">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-[#e9edef] tracking-tight">
            WhatsApp Clone
          </h1>
          <p className="text-xs text-[#8696a0] mt-0.5">
            {isRegister ? 'Create an account to start chatting & calling' : 'Sign in to your account'}
          </p>
        </div>

        {/* Quick Demo Login Bar */}
        {!isRegister && (
          <div className="mb-4 bg-[#202c33]/70 border border-[#222e35] p-3 rounded-xl">
            <div className="flex items-center gap-1.5 text-xs text-[#00a884] font-semibold mb-2">
              <Zap className="w-3.5 h-3.5" /> Quick Demo Accounts (1-Click Login):
            </div>
            <div className="grid grid-cols-3 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.username}
                  type="button"
                  onClick={() => handleQuickLogin(acc.username)}
                  className="py-1.5 px-2 bg-[#111b21] hover:bg-[#00a884]/20 hover:border-[#00a884]/40 border border-[#222e35] rounded-lg text-xs font-medium text-[#e9edef] transition cursor-pointer text-center truncate"
                  title={`Login as ${acc.name} (${acc.username})`}
                >
                  {acc.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Avatar Picker at Top of Register Form */}
          {isRegister && (
            <div className="pb-1 border-b border-[#222e35]">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-medium text-[#8696a0] uppercase tracking-wider">
                  Profile Avatar
                </label>

                {/* Single Add Photo Dropdown Trigger */}
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

              {/* Horizontal Avatar Presets with Adequate Padding to Prevent Cropping */}
              <div className="py-2.5 px-1 overflow-x-auto overflow-y-visible no-scrollbar">
                <div className="flex items-center gap-2.5 min-w-max">
                  {/* Active Custom Avatar Preview if uploaded */}
                  {!avatarIcons.some((i) => i.url === formData.avatarUrl) && formData.avatarUrl && (
                    <div className="relative group shrink-0">
                      <div className="w-11 h-11 rounded-full border-2 border-[#00a884] overflow-hidden shadow-lg shadow-[#00a884]/30 ring-2 ring-[#00a884]/50 p-0.5 bg-[#111b21]">
                        <img
                          src={formData.avatarUrl}
                          alt="Custom Photo"
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#00a884] text-[#111b21] rounded-full flex items-center justify-center shadow">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    </div>
                  )}

                  {avatarIcons.map((item, idx) => {
                    const isSelected = formData.avatarUrl === item.url;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData({ ...formData, avatarUrl: item.url })}
                        className={`relative w-10 h-10 rounded-full shrink-0 bg-[#202c33] border-2 transition-all duration-150 transform hover:scale-110 cursor-pointer overflow-hidden p-0.5 ${
                          isSelected
                            ? 'border-[#00a884] scale-110 shadow-lg shadow-[#00a884]/30 ring-2 ring-[#00a884]/50'
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
                          <div className="absolute inset-0 bg-[#00a884]/25 flex items-center justify-center rounded-full">
                            <Check className="w-3.5 h-3.5 text-[#00a884] stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-[#8696a0] uppercase tracking-wider mb-1">
              {isRegister ? 'Username' : 'Username or Email'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8696a0]">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder={isRegister ? 'e.g. alex' : 'Enter username or email'}
                className="w-full pl-10 pr-4 py-2.5 bg-[#202c33] border border-transparent focus:border-[#00a884] rounded-xl text-[#e9edef] placeholder-[#8696a0] outline-none text-sm transition"
              />
            </div>
          </div>

          {isRegister && (
            <>
              <div>
                <label className="block text-[11px] font-medium text-[#8696a0] uppercase tracking-wider mb-1">
                  Display Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8696a0]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    placeholder="e.g. Alex Johnson"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#202c33] border border-transparent focus:border-[#00a884] rounded-xl text-[#e9edef] placeholder-[#8696a0] outline-none text-sm transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#8696a0] uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8696a0]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="alex@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#202c33] border border-transparent focus:border-[#00a884] rounded-xl text-[#e9edef] placeholder-[#8696a0] outline-none text-sm transition"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-medium text-[#8696a0] uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8696a0]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-[#202c33] border border-transparent focus:border-[#00a884] rounded-xl text-[#e9edef] placeholder-[#8696a0] outline-none text-sm transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isUploadingAvatar}
            className="w-full mt-2 py-2.5 px-4 bg-[#00a884] hover:bg-[#00a884]/90 disabled:opacity-50 text-[#111b21] font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-[#00a884]/20 cursor-pointer text-sm"
          >
            {isLoading || isUploadingAvatar ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle between Login and Register */}
        <div className="mt-4 text-center text-xs text-[#8696a0]">
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setIsRegister(false); setError(''); }}
                className="text-[#00a884] hover:underline font-medium cursor-pointer"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => { setIsRegister(true); setError(''); }}
                className="text-[#00a884] hover:underline font-medium cursor-pointer"
              >
                Create one now
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Live Camera Snapshot Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
};
