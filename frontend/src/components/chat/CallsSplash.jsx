import React, { useState } from 'react';
import { Phone, Video, Lock, Plus, Users, ShieldCheck } from 'lucide-react';
import { NewChatModal } from '../sidebar/NewChatModal';
import { useCall } from '../../context/CallContext';

export const CallsSplash = () => {
  const { startCall } = useCall();
  const [isNewCallOpen, setIsNewCallOpen] = useState(false);

  return (
    <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-[#222e35] p-8 text-center border-b-[6px] border-[#00a884] select-none relative">
      <div className="max-w-md flex flex-col items-center">
        {/* Calling Icon */}
        <div className="w-20 h-20 bg-[#202c33] rounded-full flex items-center justify-center mb-6 shadow-inner text-[#00a884] ring-4 ring-[#00a884]/20">
          <Phone className="w-10 h-10" />
        </div>

        <h1 className="text-3xl font-light text-[#e9edef] mb-3 tracking-tight">
          WhatsApp Calls
        </h1>

        <p className="text-sm text-[#8696a0] leading-relaxed mb-8">
          Make high-quality, real-time voice and video calls with friends, colleagues, and groups directly from your browser.
        </p>

        {/* Start Call CTA Button */}
        <button
          type="button"
          onClick={() => setIsNewCallOpen(true)}
          className="py-3 px-6 bg-[#00a884] hover:bg-[#00a884]/90 text-[#111b21] font-semibold text-sm rounded-xl transition flex items-center gap-2 cursor-pointer shadow-lg shadow-[#00a884]/20 mb-8"
        >
          <Plus className="w-4 h-4" />
          <span>Start a New Call</span>
        </button>

        {/* Security badge */}
        <div className="flex items-center gap-2 text-xs text-[#8696a0] bg-[#111b21]/60 px-4 py-2 rounded-full border border-white/5">
          <ShieldCheck className="w-4 h-4 text-[#00a884]" />
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
