import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCall } from '../../context/CallContext';
import { NewChatModal } from './NewChatModal';
import { 
  Phone, 
  Video, 
  PhoneCall, 
  PhoneMissed, 
  PhoneIncoming, 
  PhoneOutgoing, 
  Search, 
  X, 
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Clock
} from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';

export const CallsSidebar = ({
  callLogs = [],
  isLoading = false,
  onStartCallWithUser,
}) => {
  const { user } = useAuth();
  const { startCall } = useCall();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL, MISSED
  const [isNewCallModalOpen, setIsNewCallModalOpen] = useState(false);

  const filteredLogs = callLogs.filter((log) => {
    const partnerName = log.partner?.displayName || log.partner?.username || '';
    const matchesSearch = partnerName.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (filter === 'MISSED') {
      return log.status === 'MISSED' || log.status === 'REJECTED';
    }
    return true;
  });

  const formatCallDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isToday(date)) {
        return `Today, ${format(date, 'h:mm a')}`;
      }
      if (isYesterday(date)) {
        return `Yesterday, ${format(date, 'h:mm a')}`;
      }
      return format(date, 'MMM d, h:mm a');
    } catch {
      return '';
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds <= 0) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `(${secs}s)`;
    return `(${mins}m ${secs}s)`;
  };

  const handleCallUser = (targetUser, type) => {
    if (onStartCallWithUser) {
      onStartCallWithUser(targetUser, type);
    } else {
      startCall(targetUser, type);
    }
  };

  return (
    <div className="w-full md:w-96 lg:w-[420px] h-full bg-[#111b21] border-r border-[#222e35] flex flex-col shrink-0 select-none">
      {/* Top Header */}
      <div className="h-16 bg-[#202c33] px-4 flex items-center justify-between border-b border-[#222e35]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#00a884]/15 text-[#00a884] flex items-center justify-center font-bold">
            <Phone className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-[#e9edef] tracking-tight">Calls</h2>
        </div>

        {/* Start New Call Button */}
        <button
          type="button"
          onClick={() => setIsNewCallModalOpen(true)}
          className="py-1.5 px-3 bg-[#00a884] hover:bg-[#00a884]/90 text-[#111b21] text-xs font-semibold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm"
          title="New voice or video call"
        >
          <Plus className="w-4 h-4" />
          <span>New Call</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="p-2.5 border-b border-[#222e35] space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8696a0]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search call logs"
            className="w-full pl-10 pr-9 py-1.5 bg-[#202c33] text-sm text-[#e9edef] placeholder-[#8696a0] rounded-lg outline-none border border-transparent focus:border-[#00a884] transition"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8696a0] hover:text-[#e9edef]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 px-1">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
              filter === 'ALL'
                ? 'bg-[#00a884] text-[#111b21]'
                : 'bg-[#202c33] text-[#8696a0] hover:bg-[#374248] hover:text-[#e9edef]'
            }`}
          >
            All Calls
          </button>
          <button
            onClick={() => setFilter('MISSED')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
              filter === 'MISSED'
                ? 'bg-[#00a884] text-[#111b21]'
                : 'bg-[#202c33] text-[#8696a0] hover:bg-[#374248] hover:text-[#e9edef]'
            }`}
          >
            Missed
          </button>
        </div>
      </div>

      {/* Call Logs List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#222e35]/50">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#8696a0]">
            Loading call logs...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-[#8696a0] space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#202c33] text-[#8696a0] flex items-center justify-center mx-auto mb-2">
              <PhoneMissed className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-[#e9edef]">No call logs found</p>
            <p className="text-xs text-[#8696a0]">
              To make a call, select a contact or click New Call above.
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isMissed = log.status === 'MISSED' || log.status === 'REJECTED';
            const partner = log.partner;
            const isVideo = log.callType === 'VIDEO';

            return (
              <div
                key={log.id}
                className="px-4 py-3 hover:bg-[#202c33] transition flex items-center justify-between gap-3 group"
              >
                {/* Avatar & User Details */}
                <div className="flex items-center gap-3 truncate min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={partner?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${partner?.username}`}
                      alt={partner?.displayName || partner?.username}
                      className="w-11 h-11 rounded-full object-cover border border-[#374248]"
                    />
                  </div>

                  <div className="truncate min-w-0">
                    <h3 className={`text-sm font-semibold truncate ${isMissed ? 'text-red-400' : 'text-[#e9edef]'}`}>
                      {partner?.displayName || partner?.username || 'Unknown'}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-[#8696a0] mt-0.5">
                      {/* Direction Icon */}
                      {log.outgoing ? (
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#00a884] shrink-0" />
                      ) : isMissed ? (
                        <ArrowDownLeft className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      ) : (
                        <ArrowDownLeft className="w-3.5 h-3.5 text-[#00a884] shrink-0" />
                      )}

                      <span className="truncate">
                        {formatCallDate(log.startedAt)}{' '}
                        {log.durationSeconds > 0 && formatDuration(log.durationSeconds)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Call Action Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCallUser(partner, 'AUDIO')}
                    title="Audio call"
                    className="p-2 rounded-full text-[#00a884] hover:bg-[#00a884]/20 hover:text-[#00a884] transition cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCallUser(partner, 'VIDEO')}
                    title="Video call"
                    className="p-2 rounded-full text-[#00a884] hover:bg-[#00a884]/20 hover:text-[#00a884] transition cursor-pointer"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Call Contact Selector Modal */}
      <NewChatModal
        isOpen={isNewCallModalOpen}
        onClose={() => setIsNewCallModalOpen(false)}
        onSelectUser={(target) => {
          setIsNewCallModalOpen(false);
          handleCallUser(target, 'VIDEO');
        }}
      />
    </div>
  );
};
