import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCall } from '../../context/CallContext';
import { NewChatModal } from './NewChatModal';
import { 
  Phone, 
  Video, 
  PhoneMissed, 
  Search, 
  X, 
  Plus,
  ArrowUpRight,
  ArrowDownLeft
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
    <div className="w-full md:w-96 lg:w-[410px] h-full bg-[#0f1422] border-r border-slate-800/80 flex flex-col shrink-0 select-none">
      {/* Top Header */}
      <div className="h-18 px-5 flex items-center justify-between border-b border-slate-800/80 bg-[#0f1422]">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <span>Call History</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
              {callLogs.length}
            </span>
          </h2>
        </div>

        {/* Start New Call Button */}
        <button
          type="button"
          onClick={() => setIsNewCallModalOpen(true)}
          className="py-1.5 px-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
          title="New voice or video call"
        >
          <Plus className="w-4 h-4" />
          <span>New Call</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="p-3.5 border-b border-slate-800/60 space-y-3 bg-[#0c101a]/50">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search call logs..."
            className="w-full pl-10 pr-9 py-2 bg-slate-900/90 text-sm text-slate-100 placeholder-slate-500 rounded-xl outline-none border border-slate-750 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3.5 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filter === 'ALL'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-850 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            All Calls
          </button>
          <button
            onClick={() => setFilter('MISSED')}
            className={`px-3.5 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filter === 'MISSED'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-850 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            Missed
          </button>
        </div>
      </div>

      {/* Call Logs List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Loading call logs...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto mb-2 border border-slate-700/50">
              <PhoneMissed className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-300">No call logs found</p>
            <p className="text-xs text-slate-500">
              Your incoming, outgoing, and group call logs will appear here.
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
                className="px-3.5 py-3 rounded-2xl hover:bg-slate-800/50 transition flex items-center justify-between gap-3 group border border-transparent hover:border-slate-750"
              >
                {/* Avatar & User Details */}
                <div className="flex items-center gap-3.5 truncate min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={partner?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${partner?.username}`}
                      alt={partner?.displayName || partner?.username}
                      className="w-11 h-11 rounded-2xl object-cover border border-slate-700/80 bg-slate-800"
                    />
                  </div>

                  <div className="truncate min-w-0">
                    <h3 className={`text-sm font-semibold truncate ${isMissed ? 'text-rose-400' : 'text-slate-100'}`}>
                      {partner?.displayName || partner?.username || 'Unknown'}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                      {/* Direction Icon */}
                      {log.outgoing ? (
                        <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : isMissed ? (
                        <ArrowDownLeft className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      ) : (
                        <ArrowDownLeft className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      )}

                      <span className="truncate">
                        {formatCallDate(log.startedAt)}{' '}
                        {log.durationSeconds > 0 && formatDuration(log.durationSeconds)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Call Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCallUser(partner, 'AUDIO')}
                    title="Audio call"
                    className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800/60 hover:bg-indigo-600 transition cursor-pointer border border-slate-700/40"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCallUser(partner, 'VIDEO')}
                    title="Video call"
                    className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800/60 hover:bg-violet-600 transition cursor-pointer border border-slate-700/40"
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
