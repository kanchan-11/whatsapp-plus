import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { InstantPingLogo } from '../common/InstantPingLogo';
import { 
  MessageSquare, 
  Phone, 
  Settings, 
  LogOut
} from 'lucide-react';

export const NavigationRail = ({
  activeTab,
  onSelectTab,
  onOpenProfile,
  onOpenLogoutConfirm,
  unreadChatsCount = 0,
  missedCallsCount = 0,
}) => {
  const { user } = useAuth();

  return (
    <aside className="w-18 bg-[#0c101a] border-r border-slate-800/70 flex flex-col items-center justify-between py-5 select-none shrink-0 z-20 shadow-2xl">
      {/* Top App Logo & Navigation Items */}
      <div className="flex flex-col items-center gap-6 w-full">
        {/* InstantPing Brand Logo */}
        <div className="relative group cursor-pointer" title="InstantPing">
          <InstantPingLogo className="w-10 h-10 shadow-lg shadow-indigo-500/30 transition-transform duration-200 group-hover:scale-105" />
        </div>

        <div className="w-8 h-[1px] bg-slate-800/80 my-1"></div>

        {/* Chats Tab Button */}
        <button
          type="button"
          onClick={() => onSelectTab('CHATS')}
          title="Chats"
          className={`relative p-3 rounded-2xl transition duration-200 cursor-pointer flex items-center justify-center group ${
            activeTab === 'CHATS'
              ? 'bg-gradient-to-br from-indigo-500/25 to-violet-500/20 text-indigo-400 border border-indigo-500/40 shadow-lg shadow-indigo-500/20'
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
          }`}
        >
          <MessageSquare className="w-5 h-5 transition group-hover:scale-110" />
          {unreadChatsCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[19px] h-[19px] px-1 bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/40">
              {unreadChatsCount > 99 ? '99+' : unreadChatsCount}
            </span>
          )}
        </button>

        {/* Calls Tab Button */}
        <button
          type="button"
          onClick={() => onSelectTab('CALLS')}
          title="Calls"
          className={`relative p-3 rounded-2xl transition duration-200 cursor-pointer flex items-center justify-center group ${
            activeTab === 'CALLS'
              ? 'bg-gradient-to-br from-indigo-500/25 to-violet-500/20 text-indigo-400 border border-indigo-500/40 shadow-lg shadow-indigo-500/20'
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
          }`}
        >
          <Phone className="w-5 h-5 transition group-hover:scale-110" />
          {missedCallsCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[19px] h-[19px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-rose-500/40">
              {missedCallsCount}
            </span>
          )}
        </button>
      </div>

      {/* Bottom User Avatar & Actions */}
      <div className="flex flex-col items-center gap-4 w-full">
        {/* Settings Button */}
        <button
          type="button"
          onClick={onOpenProfile}
          title="Settings"
          className="p-2.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition cursor-pointer"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* User Avatar with Status Indicator */}
        <button
          type="button"
          onClick={onOpenProfile}
          title={`${user?.displayName || user?.username} (Profile)`}
          className="relative group p-0.5 rounded-full ring-2 ring-transparent hover:ring-indigo-500 transition cursor-pointer"
        >
          <img
            src={user?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username}`}
            alt={user?.displayName || user?.username}
            className="w-9 h-9 rounded-full object-cover border border-slate-700/80 bg-slate-800"
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#0c101a] rounded-full shadow-xs"></span>
        </button>

        {/* Logout Button */}
        <button
          type="button"
          onClick={onOpenLogoutConfirm}
          title="Sign out"
          className="p-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
