import React, { useState } from 'react';
import { Phone, Video, Lock, Plus, Users, ShieldCheck } from 'lucide-react';
import { NewChatModal } from '../sidebar/NewChatModal';
import { InstantPingLogo } from '../common/InstantPingLogo';
import { useCall } from '../../context/CallContext';

export const CallsSplash = () => {
  const { startCall } = useCall();
  const [isNewCallOpen, setIsNewCallOpen] = useState(false);

  return (
    <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-[#0a0e17] chat-bg p-8 text-center select-none relative">
      <div className="max-w-md flex flex-col items-center">
        {/* Calling Brand Icon */}
        <div className="mb-6">
          <InstantPingLogo className="w-20 h-20" />
        </div>

        <h1 className="text-3xl font-extrabold text-white mb-3 tracking-tight">
          InstantPing Voice & Video
        </h1>

        <p className="text-sm text-slate-400 leading-relaxed mb-8">
          Make crisp, crystal-clear voice and HD video calls with friends, colleagues, and groups directly from your browser.
        </p>

        {/* Start Call CTA Button */}
        <button
          type="button"
          onClick={() => setIsNewCallOpen(true)}
          className="py-3 px-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm rounded-2xl transition flex items-center gap-2.5 cursor-pointer shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 mb-8"
        >
          <Plus className="w-4 h-4" />
          <span>Start a New Call</span>
        </button>

        {/* Security badge */}
        <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/80 px-4 py-2.5 rounded-full border border-slate-800 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <span>End-to-end encrypted audio and video calling</span>
        </div>
      </div>

      {/* New Call Selector Modal */}
      <NewChatModal
        isOpen={isNewCallOpen}
        onClose={() => setIsNewCallOpen(false)}
        onSelectUser={(target) => {
          setIsNewCallOpen(false);
          startCall(target, 'VIDEO');
        }}
      />
    </div>
  );
};
