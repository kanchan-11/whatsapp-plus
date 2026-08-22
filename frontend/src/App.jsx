import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider, useSocket } from './context/SocketContext';
import { CallProvider, useCall } from './context/CallContext';
import { AuthModal } from './components/auth/AuthModal';
import { NavigationRail } from './components/navigation/NavigationRail';
import { Sidebar } from './components/sidebar/Sidebar';
import { CallsSidebar } from './components/sidebar/CallsSidebar';
import { ChatArea } from './components/chat/ChatArea';
import { CallsSplash } from './components/chat/CallsSplash';
import { ProfileModal } from './components/sidebar/ProfileModal';
import { IncomingCallModal } from './components/call/IncomingCallModal';
import { CallOverlay } from './components/call/CallOverlay';
import { chatService } from './services/chatService';
import { callService } from './services/callService';
import { soundService } from './services/soundService';
import { Loader2, LogOut } from 'lucide-react';

const MainLayout = () => {
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const { subscribe } = useSocket();
  const { startCall } = useCall();

  const [activeTab, setActiveTab] = useState('CHATS'); // 'CHATS' (default) or 'CALLS'
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [isLoadingChats, setIsLoadingChats] = useState(false);

  const [callLogs, setCallLogs] = useState([]);
  const [isLoadingCalls, setIsLoadingCalls] = useState(false);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  // Fetch all chats for user
  const fetchChats = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingChats(true);
    try {
      const data = await chatService.getChats();
      setChats(data);
    } catch (err) {
      console.error('Failed to load chats', err);
    } finally {
      setIsLoadingChats(false);
    }
  }, [isAuthenticated]);

  // Fetch call history for user
  const fetchCallLogs = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingCalls(true);
    try {
      const data = await callService.getCallHistory();
      setCallLogs(data);
    } catch (err) {
      console.error('Failed to load call logs', err);
    } finally {
      setIsLoadingCalls(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchChats();
    fetchCallLogs();
  }, [fetchChats, fetchCallLogs]);

  // Subscribe to personal real-time chat creation and update notifications
  useEffect(() => {
    if (!user?.id || !subscribe) return;

    const sub = subscribe(`/topic/user.${user.id}.chats`, (frame) => {
      try {
        const incomingChat = JSON.parse(frame.body);
        setChats((prevChats) => {
          const idx = prevChats.findIndex((c) => c.id === incomingChat.id);
          if (idx === -1) {
            return [incomingChat, ...prevChats];
          }
          const next = [...prevChats];
          next.splice(idx, 1);
          return [incomingChat, ...next];
        });

        if (
          incomingChat.lastMessage &&
          incomingChat.lastMessage.sender?.id !== user.id &&
          selectedChatId !== incomingChat.id
        ) {
          soundService.playMessageTone();
        }
      } catch (err) {
        console.error('Error handling user chat notification', err);
      }
    });

    return () => {
      sub.unsubscribe();
    };
  }, [user?.id, subscribe, selectedChatId]);

  // Subscribe to personal real-time call log notifications
  useEffect(() => {
    if (!user?.id || !subscribe) return;

    const callSub = subscribe(`/topic/user.${user.id}.calls`, (frame) => {
      try {
        const newCallLog = JSON.parse(frame.body);
        setCallLogs((prevLogs) => [newCallLog, ...prevLogs]);
      } catch (err) {
        console.error('Error handling call log update', err);
      }
    });

    return () => {
      callSub.unsubscribe();
    };
  }, [user?.id, subscribe]);

  // Handle new message update across all chats from active ChatArea
  const handleNewMessageReceived = useCallback((chatId, newMsg) => {
    setChats((prevChats) => {
      const chatIndex = prevChats.findIndex((c) => c.id === chatId);
      if (chatIndex === -1) {
        chatService.getChats().then(setChats);
        return prevChats;
      }

      const updatedChat = {
        ...prevChats[chatIndex],
        lastMessage: newMsg,
        updatedAt: newMsg.createdAt,
        unreadCount:
          selectedChatId === chatId
            ? 0
            : prevChats[chatIndex].unreadCount + (newMsg.sender?.id !== user?.id ? 1 : 0),
      };

      const nextChats = [...prevChats];
      nextChats.splice(chatIndex, 1);
      return [updatedChat, ...nextChats];
    });
  }, [selectedChatId, user?.id]);

  // Handle direct chat creation
  const handleStartDirectChat = async (targetUser) => {
    try {
      const chat = await chatService.getOrCreateDirectChat(targetUser.id);
      await fetchChats();
      setSelectedChatId(chat.id);
    } catch (err) {
      console.error('Failed to create direct chat', err);
    }
  };

  // Handle group chat creation
  const handleCreateGroupChat = async (groupData) => {
    const newGroup = await chatService.createGroupChat(groupData);
    await fetchChats();
    setSelectedChatId(newGroup.id);
  };

  // Handle group settings update
  const handleGroupUpdated = (updatedGroup) => {
    setChats((prev) =>
      prev.map((c) => (c.id === updatedGroup.id ? updatedGroup : c))
    );
  };

  const totalUnreadChats = chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  const missedCallsCount = callLogs.filter(
    (log) => (log.status === 'MISSED' || log.status === 'REJECTED') && !log.outgoing
  ).length;

  if (authLoading) {
    return (
      <div className="h-screen w-screen bg-[#111b21] flex items-center justify-center text-[#00a884]">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthModal />;
  }

  const selectedChat = chats.find((c) => c.id === selectedChatId) || null;

  return (
    <div className="h-screen w-screen bg-[#0c1317] flex items-center justify-center overflow-hidden">
      {/* WhatsApp Main App Container */}
      <div className="w-full h-full max-w-[1800px] max-h-[1050px] flex overflow-hidden shadow-2xl bg-[#111b21]">
        {/* Dock Navigation Rail (Chats, Calls, Settings, Profile, Logout) */}
        <NavigationRail
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenLogoutConfirm={() => setIsLogoutConfirmOpen(true)}
          unreadChatsCount={totalUnreadChats}
          missedCallsCount={missedCallsCount}
        />

        {/* Dynamic Sidebar View (Chats vs Calls) */}
        {activeTab === 'CHATS' ? (
          <Sidebar
            chats={chats}
            selectedChatId={selectedChatId}
            onSelectChat={(id) => {
              setSelectedChatId(id);
              setChats((prev) =>
                prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
              );
            }}
            onStartDirectChat={handleStartDirectChat}
            onCreateGroupChat={handleCreateGroupChat}
            isLoading={isLoadingChats}
          />
        ) : (
          <CallsSidebar
            callLogs={callLogs}
            isLoading={isLoadingCalls}
            onStartCallWithUser={(targetUser, type) => startCall(targetUser, type)}
          />
        )}

        {/* Dynamic Main Panel View */}
        {activeTab === 'CHATS' ? (
          <ChatArea
            chat={selectedChat}
            onGroupUpdated={handleGroupUpdated}
            onNewMessageReceived={handleNewMessageReceived}
          />
        ) : (
          <CallsSplash />
        )}
      </div>

      {/* Profile Settings Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      {/* Logout Confirmation Popup Modal */}
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="w-full max-w-sm bg-[#111b21] border border-[#222e35] rounded-2xl shadow-2xl overflow-hidden flex flex-col p-6 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-6 h-6" />
            </div>

            <h3 className="text-base font-semibold text-[#e9edef] text-center mb-1.5">
              Log out of WhatsApp?
            </h3>
            <p className="text-xs text-[#8696a0] text-center mb-6 leading-relaxed">
              Are you sure you want to log out? You will need to log in again to access your messages and calls.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="flex-1 py-2.5 px-4 bg-[#202c33] hover:bg-[#374248] text-[#e9edef] text-xs font-semibold rounded-xl transition cursor-pointer border border-[#374248]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogoutConfirmOpen(false);
                  logout();
                }}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-xl transition cursor-pointer shadow-lg shadow-red-600/30 flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global WebRTC Incoming Call Notification Modal */}
      <IncomingCallModal />

      {/* Fullscreen Video / Audio Call Overlay */}
      <CallOverlay />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <CallProvider>
          <MainLayout />
        </CallProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
