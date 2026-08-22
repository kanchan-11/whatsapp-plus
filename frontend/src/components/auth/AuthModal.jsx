import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { chatService } from '../../services/chatService';
import { CameraCaptureModal } from '../media/CameraCaptureModal';
import { InstantPingLogo } from '../common/InstantPingLogo';
import { 
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
    <div className="fixed inset-0 bg-[#080b11] flex items-center justify-center p-4 z-50 overflow-y-auto chat-bg select-none">
      {/* Ambient background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-25">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600 rounded-full filter blur-[120px]"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-600 rounded-full filter blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md bg-[#0f1422]/95 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-7 relative z-10 my-6 shadow-indigo-950/40">
        {/* Logo Header */}
        <div className="text-center mb-5 flex flex-col items-center">
          <div className="mb-3">
            <InstantPingLogo className="w-14 h-14" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            InstantPing
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isRegister ? 'Create an account to start chatting & calling' : 'Sign in to access your conversations'}
          </p>
        </div>

        {/* Quick Demo Login Bar */}
        {!isRegister && (
          <div className="mb-5 bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
            <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold mb-2">
              <Zap className="w-3.5 h-3.5" /> 1-Click Demo Logins:
            </div>
            <div className="grid grid-cols-3 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.username}
                  type="button"
                  onClick={() => handleQuickLogin(acc.username)}
                  className="py-1.5 px-2 bg-slate-800/80 hover:bg-indigo-600 hover:text-white border border-slate-750 rounded-xl text-xs font-semibold text-slate-200 transition cursor-pointer text-center truncate shadow-xs"
                  title={`Login as ${acc.name} (${acc.username})`}
                >
                  {acc.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Avatar Picker at Top of Register Form */}
          {isRegister && (
            <div className="pb-2 border-b border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Choose Avatar
                </label>

                {/* Add Photo Dropdown Trigger */}
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
                    className="py-1 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-indigo-400 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${isAddPhotoDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isAddPhotoDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-44 bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl py-1.5 z-30 animate-in fade-in zoom-in-95">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddPhotoDropdownOpen(false);
                          fileInputRef.current?.click();
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2.5 transition cursor-pointer"
                      >
                        <ImageIcon className="w-4 h-4 text-indigo-400" />
                        <span>Choose from Gallery</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddPhotoDropdownOpen(false);
                          setIsCameraOpen(true);
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2.5 transition cursor-pointer"
                      >
                        <Camera className="w-4 h-4 text-violet-400" />
                        <span>Take with Camera</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Horizontal Avatar Presets */}
              <div className="py-2 px-1 overflow-x-auto overflow-y-visible no-scrollbar">
                <div className="flex items-center gap-2.5 min-w-max">
                  {!avatarIcons.some((i) => i.url === formData.avatarUrl) && formData.avatarUrl && (
                    <div className="relative group shrink-0">
                      <div className="w-11 h-11 rounded-2xl border-2 border-indigo-500 overflow-hidden shadow-lg shadow-indigo-500/30 p-0.5 bg-slate-900">
                        <img
                          src={formData.avatarUrl}
                          alt="Custom Photo"
                          className="w-full h-full object-cover rounded-xl"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-indigo-500 text-white rounded-full flex items-center justify-center shadow">
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
                        className={`relative w-10 h-10 rounded-2xl shrink-0 bg-slate-800 border-2 transition-all duration-150 transform hover:scale-110 cursor-pointer overflow-hidden p-0.5 ${
                          isSelected
                            ? 'border-indigo-500 scale-110 shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-500/40'
                            : 'border-transparent opacity-75 hover:opacity-100 hover:border-slate-700'
                        }`}
                        title={item.label}
                      >
                        <img
                          src={item.url}
                          alt={item.label}
                          className="w-full h-full object-cover rounded-xl pointer-events-none"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center rounded-xl">
                            <Check className="w-3.5 h-3.5 text-indigo-400 stroke-[3]" />
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
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              {isRegister ? 'Username' : 'Username or Email'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder={isRegister ? 'e.g. alex' : 'Enter username or email'}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-750 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl text-slate-100 placeholder-slate-500 outline-none text-sm transition"
              />
            </div>
          </div>

          {isRegister && (
            <>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Display Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    placeholder="e.g. Alex Johnson"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-750 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl text-slate-100 placeholder-slate-500 outline-none text-sm transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="alex@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-750 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl text-slate-100 placeholder-slate-500 outline-none text-sm transition"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-750 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl text-slate-100 placeholder-slate-500 outline-none text-sm transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isUploadingAvatar}
            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-bold rounded-2xl transition flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/30 hover:scale-102 active:scale-98 cursor-pointer text-sm"
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
        <div className="mt-5 text-center text-xs text-slate-400">
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setIsRegister(false); setError(''); }}
                className="text-indigo-400 hover:text-indigo-300 hover:underline font-bold cursor-pointer"
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
                className="text-indigo-400 hover:text-indigo-300 hover:underline font-bold cursor-pointer"
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
