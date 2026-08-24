import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { socialAuthService } from '../../services/socialAuthService';
import { CameraCaptureModal } from '../media/CameraCaptureModal';
import { InstantPingLogo } from '../common/InstantPingLogo';
import { 
  User, 
  Lock, 
  Mail, 
  Sparkles, 
  ArrowRight, 
  Loader2, 
  Image as ImageIcon, 
  Camera, 
  ChevronDown, 
  Plus, 
  Check, 
  Zap, 
  X 
} from 'lucide-react';

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=alex',
  'https://api.dicebear.com/7.x/bottts/svg?seed=sarah',
  'https://api.dicebear.com/7.x/bottts/svg?seed=felix',
  'https://api.dicebear.com/7.x/bottts/svg?seed=mimi',
  'https://api.dicebear.com/7.x/bottts/svg?seed=shadow',
  'https://api.dicebear.com/7.x/bottts/svg?seed=sparky',
];

// SVG Icon for Google
const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

// SVG Icon for GitHub
const GitHubIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

export const AuthModal = () => {
  const { login, register, socialLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    displayName: '',
    avatarUrl: PRESET_AVATARS[0],
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null); // 'google' | 'github' | null

  // Media / Avatar upload states
  const [isAddPhotoDropdownOpen, setIsAddPhotoDropdownOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  const demoAccounts = [
    { name: 'Demo User', username: 'user', pass: 'password123' },
    { name: 'Alice', username: 'alice', pass: 'password123' },
    { name: 'Bob', username: 'bob', pass: 'password123' },
  ];

  const handleQuickLogin = async (username) => {
    setError('');
    setIsLoading(true);
    try {
      await login({ usernameOrEmail: username, password: 'password123' });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Direct Google Sign In (Triggers Google's Official OAuth Account Chooser)
  const handleGoogleSignIn = async () => {
    setError('');
    setSocialLoading('google');
    try {
      const profile = await socialAuthService.directGoogleSignIn();
      await socialLogin(profile);
    } catch (err) {
      console.warn('Google sign-in error', err);
      if (err.message && !err.message.includes('closed') && !err.message.includes('cancelled')) {
        setError(err.message);
      }
    } finally {
      setSocialLoading(null);
    }
  };

  // Direct GitHub Sign In (Triggers GitHub's Official Account Chooser / API)
  const handleGitHubSignIn = async () => {
    setError('');
    setSocialLoading('github');
    try {
      const profile = await socialAuthService.directGitHubSignIn();
      await socialLogin(profile);
    } catch (err) {
      console.warn('GitHub sign-in error', err);
      if (err.message && !err.message.includes('closed') && !err.message.includes('cancelled')) {
        setError(err.message);
      }
    } finally {
      setSocialLoading(null);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    setIsAddPhotoDropdownOpen(false);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, avatarUrl: reader.result }));
        setIsUploadingAvatar(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Failed to read file', err);
      setIsUploadingAvatar(false);
    }
  };

  const handleCameraCapture = (capturedDataUrl) => {
    setFormData((prev) => ({ ...prev, avatarUrl: capturedDataUrl }));
    setIsCameraOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isRegister) {
        await register(formData);
      } else {
        await login({
          usernameOrEmail: formData.username,
          password: formData.password,
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
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

      <div className="w-full max-w-md bg-[#0f1422]/95 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 relative z-10 my-6 shadow-indigo-950/40">
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

        {/* Direct Google & GitHub OAuth Buttons */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {/* Sign in with Google */}
          <button
            type="button"
            disabled={isLoading || !!socialLoading}
            onClick={handleGoogleSignIn}
            className="py-2.5 px-3 bg-slate-900/90 hover:bg-slate-800 border border-slate-750 hover:border-slate-650 rounded-2xl text-xs font-semibold text-slate-200 transition cursor-pointer flex items-center justify-center gap-2 shadow-xs hover:scale-102 active:scale-98"
          >
            {socialLoading === 'google' ? (
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            ) : (
              <GoogleIcon />
            )}
            <span>Google</span>
          </button>

          {/* Sign in with GitHub */}
          <button
            type="button"
            disabled={isLoading || !!socialLoading}
            onClick={handleGitHubSignIn}
            className="py-2.5 px-3 bg-slate-900/90 hover:bg-slate-800 border border-slate-750 hover:border-slate-650 rounded-2xl text-xs font-semibold text-slate-200 transition cursor-pointer flex items-center justify-center gap-2 shadow-xs hover:scale-102 active:scale-98"
          >
            {socialLoading === 'github' ? (
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            ) : (
              <GitHubIcon />
            )}
            <span>GitHub</span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-[1px] bg-slate-800"></div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Or continue with
          </span>
          <div className="flex-1 h-[1px] bg-slate-800"></div>
        </div>

        {/* Quick Demo Login Bar */}
        {!isRegister && (
          <div className="mb-4 bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
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
                        <span>Take Photo</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Preset Avatars Row */}
              <div className="flex items-center justify-between gap-1.5 py-1">
                {PRESET_AVATARS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFormData({ ...formData, avatarUrl: url })}
                    className={`relative p-1 rounded-2xl border-2 transition cursor-pointer hover:scale-105 ${
                      formData.avatarUrl === url
                        ? 'border-indigo-500 bg-indigo-500/20 shadow-md shadow-indigo-500/30'
                        : 'border-transparent hover:border-slate-700 bg-slate-850'
                    }`}
                  >
                    <img
                      src={url}
                      alt={`Avatar ${i + 1}`}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    {formData.avatarUrl === url && (
                      <span className="absolute -top-1 -right-1 bg-indigo-600 text-white rounded-full p-0.5 shadow-xs">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Display Name (for Register) */}
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Display Name
              </label>
              <div className="relative">
                <Sparkles className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="e.g. Alex Rivera"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-750 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl text-slate-100 placeholder-slate-500 outline-none text-sm transition"
                />
              </div>
            </div>
          )}

          {/* Username */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="e.g. alex"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-750 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl text-slate-100 placeholder-slate-500 outline-none text-sm transition"
              />
            </div>
          </div>

          {/* Email (for Register) */}
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
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
          )}

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
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
            disabled={isLoading || isUploadingAvatar || !!socialLoading}
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
