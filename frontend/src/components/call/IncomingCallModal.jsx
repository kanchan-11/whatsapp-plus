import React from 'react';
import { useCall } from '../../context/CallContext';
import { Phone, PhoneOff, Video, Users } from 'lucide-react';

export const IncomingCallModal = () => {
  const { callState, callType, callPartner, acceptCall, rejectCall } = useCall();

  if (callState !== 'INCOMING' || !callPartner) return null;

  const isGroup = !!callPartner.isGroup;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in select-none">
      <div className="w-full max-w-sm bg-[#0f1422] border border-slate-800 rounded-3xl p-7 text-center shadow-2xl relative overflow-hidden shadow-indigo-950/50">
        {/* Glowing aura */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full filter blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-violet-500/20 rounded-full filter blur-3xl pointer-events-none"></div>

        {/* Caller / Group Avatar */}
        <div className="relative inline-block mb-5">
          <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-indigo-500 animate-ring-pulse shadow-2xl mx-auto bg-slate-800 p-0.5">
            <img
              src={
                isGroup
                  ? callPartner.groupImage || `https://api.dicebear.com/7.x/initials/svg?seed=${callPartner.groupName}`
                  : callPartner.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${callPartner.username}`
              }
              alt={isGroup ? callPartner.groupName : callPartner.displayName || callPartner.username}
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 p-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl shadow-lg border border-white/10">
            {callType === 'VIDEO' ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
          </div>
        </div>

        {/* Info */}
        <h3 className="text-xl font-extrabold text-white mb-1 tracking-tight">
          {isGroup ? callPartner.groupName : callPartner.displayName || callPartner.username}
        </h3>

        {isGroup ? (
          <p className="text-xs text-slate-400 mb-8">
            <span className="text-indigo-400 font-semibold">{callPartner.displayName || callPartner.username}</span> started a Group {callType === 'VIDEO' ? 'Video' : 'Voice'} Call
          </p>
        ) : (
          <p className="text-xs text-indigo-400 font-bold tracking-wider uppercase mb-8 animate-pulse">
            Incoming {callType === 'VIDEO' ? 'Video' : 'Voice'} Call...
          </p>
        )}

        {/* Actions: Accept or Decline */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={rejectCall}
            className="w-14 h-14 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-600/30 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            title="Decline"
          >
            <PhoneOff className="w-6 h-6" />
          </button>

          <button
            onClick={acceptCall}
            className="w-14 h-14 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            title="Accept"
          >
            <Phone className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
