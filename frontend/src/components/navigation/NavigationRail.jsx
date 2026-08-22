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
  isChatOpen = false,
}) => {
  const { user } = useAuth();

  return (
    <>
      {/* DESKTOP LEFT VERTICAL RAIL (md and above) */}
      <aside className="hidden md:flex w-18 bg-[#0c101a] border-r border-slate-800/70 flex-col items-center justify-between py-5 select-none shrink-0 z-20 shadow-2xl">
        {/* Top App Logo & Navigation Items */}
        <div className="flex flex-col items-center gap-6 w-full">
          {/* InstantPing Brand Logo */}
          <div className="relative group cursor-pointer" title="InstantPing">
            <InstantPingLogo className="w-10 h-10 transition-transform duration-200 group-hover:scale-105" />
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

      {/* MOBILE BOTTOM NAVIGATION DOCK (Visible on mobile when no active chat is open) */}
      {!isChatOpen && (
        <nav className="flex md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0c101a]/95 backdrop-blur-xl border-t border-slate-800 items-center justify-around px-4 z-40 shadow-2xl select-none">
          {/* Mobile Chats Button */}
          <button
            type="button"
            onClick={() => onSelectTab('CHATS')}
            className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition cursor-pointer ${
              activeTab === 'CHATS' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <MessageSquare className="w-5 h-5" />
              {unreadChatsCount > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[17px] h-[17px] px-1 bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center">
                  {unreadChatsCount > 99 ? '99+' : unreadChatsCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold mt-1">Chats</span>
          </button>

          {/* Mobile Calls Button */}
          <button
            type="button"
            onClick={() => onSelectTab('CALLS')}
            className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition cursor-pointer ${
              activeTab === 'CALLS' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Phone className="w-5 h-5" />
              {missedCallsCount > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[17px] h-[17px] px-1 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {missedCallsCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold mt-1">Calls</span>
          </button>

          {/* Mobile Profile / Settings */}
          <button
            type="button"
            onClick={onOpenProfile}
            className="flex flex-col items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <img
              src={user?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username}`}
              alt="profile"
              className="w-5 h-5 rounded-full object-cover border border-slate-700"
            />
            <span className="text-[10px] font-bold mt-1">Profile</span>
          </button>

          {/* Mobile Logout */}
          <button
            type="button"
            onClick={onOpenLogoutConfirm}
            className="flex flex-col items-center justify-center p-2 rounded-xl text-slate-400 hover:text-rose-400 transition cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-1">Logout</span>
          </button>
        </nav>
      )}
    </>
  );
};
