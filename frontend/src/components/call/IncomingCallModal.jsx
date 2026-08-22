import React from 'react';
import { useCall } from '../../context/CallContext';
import { Phone, PhoneOff, Video, Users } from 'lucide-react';

export const IncomingCallModal = () => {
  const { callState, callType, callPartner, acceptCall, rejectCall } = useCall();

  if (callState !== 'INCOMING' || !callPartner) return null;

  const isGroup = !!callPartner.isGroup;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="w-full max-w-sm bg-[#111b21] border border-[#222e35] rounded-3xl p-6 text-center shadow-2xl relative overflow-hidden">
        {/* Glowing aura */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#00a884]/20 rounded-full filter blur-2xl pointer-events-none"></div>

        {/* Caller / Group Avatar */}
        <div className="relative inline-block mb-4">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#00a884] animate-ring-pulse shadow-xl mx-auto bg-[#202c33]">
            <img
              src={
                isGroup
                  ? callPartner.groupImage || `https://api.dicebear.com/7.x/initials/svg?seed=${callPartner.groupName}`
                  : callPartner.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${callPartner.username}`
              }
              alt={isGroup ? callPartner.groupName : callPartner.displayName || callPartner.username}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute bottom-0 right-0 p-1.5 bg-[#00a884] text-[#111b21] rounded-full shadow-md">
            {callType === 'VIDEO' ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
          </div>
        </div>

        {/* Info */}
        <h3 className="text-xl font-bold text-[#e9edef] mb-1">
          {isGroup ? callPartner.groupName : callPartner.displayName || callPartner.username}
        </h3>

        {isGroup ? (
          <p className="text-xs text-[#8696a0] mb-8">
            <span className="text-[#00a884] font-medium">{callPartner.displayName || callPartner.username}</span> started a Group {callType === 'VIDEO' ? 'Video' : 'Voice'} Call
          </p>
        ) : (
          <p className="text-xs text-[#00a884] font-medium tracking-wide uppercase mb-8">
            Incoming {callType === 'VIDEO' ? 'Video' : 'Voice'} Call...
          </p>
        )}

        {/* Actions: Accept or Decline */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={rejectCall}
            className="w-14 h-14 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            title="Decline"
          >
            <PhoneOff className="w-6 h-6" />
          </button>

          <button
            onClick={acceptCall}
            className="w-14 h-14 bg-[#00a884] hover:bg-[#00a884]/90 text-[#111b21] rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            title="Accept"
          >
            <Phone className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
