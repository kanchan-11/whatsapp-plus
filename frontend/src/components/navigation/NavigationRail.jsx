import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  MessageSquare, 
  Phone, 
  Settings, 
  LogOut, 
  CircleDot
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
    <aside className="w-16 bg-[#202c33] border-r border-[#222e35] flex flex-col items-center justify-between py-4 select-none shrink-0 z-20">
      {/* Top Navigation Items */}
      <div className="flex flex-col items-center gap-4 w-full">
        {/* Chats Tab */}
        <button
          type="button"
          onClick={() => onSelectTab('CHATS')}
          title="Chats"
          className={`relative p-3 rounded-xl transition cursor-pointer flex items-center justify-center ${
            activeTab === 'CHATS'
              ? 'bg-[#374248] text-[#00a884] shadow-sm'
              : 'text-[#8696a0] hover:text-[#e9edef] hover:bg-[#111b21]/50'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          {unreadChatsCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#00a884] text-[#111b21] text-[10px] font-bold rounded-full flex items-center justify-center shadow">
              {unreadChatsCount > 99 ? '99+' : unreadChatsCount}
            </span>
          )}
        </button>

        {/* Calls Tab */}
        <button
          type="button"
          onClick={() => onSelectTab('CALLS')}
          title="Calls"
          className={`relative p-3 rounded-xl transition cursor-pointer flex items-center justify-center ${
            activeTab === 'CALLS'
              ? 'bg-[#374248] text-[#00a884] shadow-sm'
              : 'text-[#8696a0] hover:text-[#e9edef] hover:bg-[#111b21]/50'
          }`}
        >
          <Phone className="w-5 h-5" />
          {missedCallsCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">
              {missedCallsCount}
            </span>
          )}
        </button>
      </div>

      {/* Bottom Profile & Actions */}
      <div className="flex flex-col items-center gap-3 w-full">
        {/* Profile Settings Icon */}
        <button
          type="button"
          onClick={onOpenProfile}
          title="Settings"
          className="p-2.5 rounded-xl text-[#8696a0] hover:text-[#e9edef] hover:bg-[#111b21]/50 transition cursor-pointer"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* User Avatar */}
        <button
          type="button"
          onClick={onOpenProfile}
          title={`${user?.displayName || user?.username} (Profile)`}
          className="relative group p-1 rounded-full hover:ring-2 hover:ring-[#00a884] transition cursor-pointer"
        >
          <img
            src={user?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username}`}
            alt={user?.displayName || user?.username}
            className="w-8 h-8 rounded-full object-cover border border-[#374248]"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00a884] border-2 border-[#202c33] rounded-full"></span>
        </button>

        {/* Logout button */}
        <button
          type="button"
          onClick={onOpenLogoutConfirm}
          title="Log out"
          className="p-2.5 rounded-xl text-[#8696a0] hover:text-red-400 hover:bg-red-500/15 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
