import React, { useEffect, useRef, useState } from 'react';
import { useCall } from '../../context/CallContext';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  PhoneOff, 
  Users,
  Volume2,
  X,
  ShieldCheck,
  Maximize2,
  Minimize2
} from 'lucide-react';

const ParticipantTile = ({ participant, isLocal = false, isVideoOff = false, isMuted = false }) => {
  const videoRef = useRef(null);
  const [streamHasVideo, setStreamHasVideo] = useState(true);

  useEffect(() => {
    if (!participant?.stream) {
      setStreamHasVideo(false);
      return;
    }

    const videoTracks = participant.stream.getVideoTracks();
    setStreamHasVideo(videoTracks.length > 0 && videoTracks[0].enabled);

    if (videoRef.current) {
      videoRef.current.srcObject = participant.stream;
      videoRef.current.play().catch(() => {});
    }

    const track = videoTracks[0];
    if (track) {
      const handleMute = () => setStreamHasVideo(false);
      const handleUnmute = () => setStreamHasVideo(true);
      track.addEventListener('mute', handleMute);
      track.addEventListener('unmute', handleUnmute);
      track.addEventListener('ended', handleMute);

      return () => {
        track.removeEventListener('mute', handleMute);
        track.removeEventListener('unmute', handleUnmute);
        track.removeEventListener('ended', handleMute);
      };
    }
  }, [participant?.stream]);

  const showVideo = streamHasVideo && !(isLocal && isVideoOff);

  return (
    <div className="relative flex-1 min-w-[240px] max-w-full h-full min-h-[200px] bg-[#202c33] rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center shadow-lg group">
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          showVideo ? 'opacity-100' : 'opacity-0 absolute'
        } ${isLocal ? 'transform -scale-x-100' : ''}`}
      />

      {/* Fallback Avatar Placeholder when camera is off */}
      {!showVideo && (
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#00a884] shadow-md mb-2 bg-[#111b21]">
            <img
              src={participant?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${participant?.username}`}
              alt={participant?.displayName || participant?.username}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-xs font-semibold text-[#e9edef] truncate max-w-[150px]">
            {participant?.displayName || participant?.username} {isLocal && '(You)'}
          </span>
          <span className="text-[10px] text-[#8696a0] mt-0.5">Camera off</span>
        </div>
      )}

      {/* Participant Name & Status Badge */}
      <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[11px] font-medium text-[#e9edef] flex items-center gap-1.5 border border-white/10 z-10">
        <span>{participant?.displayName || participant?.username} {isLocal && '(You)'}</span>
        {(isMuted || (isLocal && isMuted)) && <MicOff className="w-3 h-3 text-red-400" />}
      </div>
    </div>
  );
};

export const CallOverlay = () => {
  const {
    callState,
    callType,
    callPartner,
    isGroupCall,
    groupInfo,
    groupParticipants,
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    isScreenSharing,
    endCall,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
  } = useCall();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const [duration, setDuration] = useState(0);
  const [showParticipantsList, setShowParticipantsList] = useState(false);

  // Set local video stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(() => {});
    }
  }, [localStream]);

  // Set remote video and audio streams for 1-on-1 calls
  useEffect(() => {
    if (!isGroupCall) {
      if (remoteVideoRef.current && remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.play().catch(() => {});
      }
      if (remoteAudioRef.current && remoteStream) {
        remoteAudioRef.current.srcObject = remoteStream;
        remoteAudioRef.current.play().catch(() => {});
      }
    }
  }, [remoteStream, isGroupCall]);

  // Call duration counter
  useEffect(() => {
    let interval = null;
    if (callState === 'CONNECTED') {
      setDuration(0);
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setDuration(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callState]);

  // Only render during active/outgoing calls
  if (callState !== 'OUTGOING' && callState !== 'CONNECTED') {
    return null;
  }

  const formatDuration = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const displayName = isGroupCall
    ? groupInfo?.name || 'Group Call'
    : callPartner?.displayName || callPartner?.username || 'Voice Call';

  const avatarSrc = isGroupCall
    ? groupInfo?.image || `https://api.dicebear.com/7.x/initials/svg?seed=${groupInfo?.name || 'Group'}`
    : callPartner?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${callPartner?.username}`;

  return (
    <div className="fixed inset-0 bg-[#0c1317] z-50 flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in select-none">
      {/* Remote Audio element for 1-on-1 */}
      {!isGroupCall && <audio ref={remoteAudioRef} autoPlay />}

      {/* Top Header Bar */}
      <div className="w-full flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-[#202c33] shrink-0">
            <img
              src={avatarSrc}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#e9edef] flex items-center gap-1.5">
              {displayName}
              {isGroupCall && <Users className="w-3.5 h-3.5 text-[#00a884]" />}
            </h3>
            <p className="text-xs text-[#8696a0]">
              {callState === 'OUTGOING'
                ? 'Ringing...'
                : isGroupCall
                  ? `Group Video Call • ${groupParticipants.length} connected • ${formatDuration(duration)}`
                  : `Connected • ${formatDuration(duration)}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Participants toggle button for group call */}
          {isGroupCall && (
            <button
              type="button"
              onClick={() => setShowParticipantsList(!showParticipantsList)}
              className="px-3 py-1.5 bg-[#202c33] hover:bg-[#374248] border border-white/10 rounded-full text-xs text-[#e9edef] font-medium flex items-center gap-1.5 transition cursor-pointer"
              title="View participants in call"
            >
              <Users className="w-3.5 h-3.5 text-[#00a884]" />
              <span>{groupParticipants.length} In Call</span>
            </button>
          )}

          <span className="hidden sm:flex px-3 py-1.5 bg-[#202c33] border border-white/10 rounded-full text-xs text-[#00a884] font-medium items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00a884] animate-pulse"></span>
            End-to-End Encrypted
          </span>
        </div>
      </div>

      {/* Main Call View Area */}
      <div className="w-full flex-1 flex items-center justify-center my-3 relative rounded-3xl overflow-hidden bg-[#111b21] border border-[#222e35] p-3">
        {/* GROUP CALL GRID VIEW */}
        {isGroupCall ? (
          <div className="w-full h-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto">
            {groupParticipants.map((participant) => (
              <ParticipantTile
                key={participant.id}
                participant={participant}
                isLocal={participant.isLocal}
                isVideoOff={participant.isLocal ? isVideoOff : false}
                isMuted={participant.isLocal ? isMuted : false}
              />
            ))}
          </div>
        ) : callType === 'VIDEO' ? (
          /* 1-ON-1 VIDEO CALL */
          <>
            {remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-6">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#202c33] shadow-2xl mb-4 bg-[#202c33]">
                  <img
                    src={avatarSrc}
                    alt="partner"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="text-lg font-semibold text-[#e9edef] mb-1">
                  {displayName}
                </h4>
                <p className="text-xs text-[#8696a0] animate-pulse">
                  {callState === 'OUTGOING' ? 'Waiting for answer...' : 'Connecting video stream...'}
                </p>
              </div>
            )}

            {/* Local Video PIP (Picture-in-Picture) */}
            <div className="absolute top-4 right-4 w-36 sm:w-48 h-48 sm:h-64 bg-[#202c33] rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-20">
              {isVideoOff ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-[#8696a0]">
                  <VideoOff className="w-8 h-8 mb-1 text-red-400" />
                  <span className="text-[10px]">Camera off</span>
                </div>
              ) : (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
              )}
            </div>
          </>
        ) : (
          /* 1-ON-1 VOICE CALL */
          <div className="flex flex-col items-center justify-center text-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#00a884] shadow-2xl mb-4 bg-[#202c33] animate-ring-pulse">
                <img
                  src={avatarSrc}
                  alt="partner"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute bottom-4 right-2 p-2 bg-[#00a884] text-[#111b21] rounded-full shadow-md">
                <Volume2 className="w-4 h-4" />
              </span>
            </div>
            <h3 className="text-2xl font-bold text-[#e9edef] mb-1">
              {displayName}
            </h3>
            <p className="text-sm text-[#00a884] font-medium">
              {callState === 'OUTGOING' ? 'Calling...' : formatDuration(duration)}
            </p>
          </div>
        )}

        {/* Participants Drawer (Toggleable in Group Calls) */}
        {isGroupCall && showParticipantsList && (
          <div className="absolute top-3 right-3 bottom-3 w-72 bg-[#182229]/95 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-4 flex flex-col z-30 animate-in slide-in-from-right-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <h4 className="text-xs font-bold text-[#e9edef] tracking-wider uppercase flex items-center gap-2">
                <Users className="w-4 h-4 text-[#00a884]" />
                <span>Call Participants ({groupParticipants.length})</span>
              </h4>
              <button
                onClick={() => setShowParticipantsList(false)}
                className="text-[#8696a0] hover:text-[#e9edef] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {groupParticipants.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#202c33]/60 border border-white/5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={p.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${p.username}`}
                      alt={p.displayName || p.username}
                      className="w-8 h-8 rounded-full object-cover border border-[#00a884]/40"
                    />
                    <div className="truncate min-w-0">
                      <p className="text-xs font-semibold text-[#e9edef] truncate">
                        {p.displayName || p.username} {p.isLocal && '(You)'}
                      </p>
                      <p className="text-[10px] text-[#00a884]">Connected</p>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-[#00a884]"></span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Control Toolbar */}
      <div className="flex items-center gap-4 z-20 bg-[#202c33]/85 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 shadow-2xl">
        {/* Mute Mic */}
        <button
          onClick={toggleMute}
          className={`p-3.5 rounded-full transition cursor-pointer ${
            isMuted
              ? 'bg-red-500/20 text-red-400 border border-red-500/40'
              : 'bg-[#374248] text-[#e9edef] hover:bg-[#4a575f]'
          }`}
          title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Camera Toggle (Video Calls) */}
        {callType === 'VIDEO' && (
          <button
            onClick={toggleVideo}
            className={`p-3.5 rounded-full transition cursor-pointer ${
              isVideoOff
                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                : 'bg-[#374248] text-[#e9edef] hover:bg-[#4a575f]'
            }`}
            title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>
        )}

        {/* Screen Share (Video Calls) */}
        {callType === 'VIDEO' && (
          <button
            onClick={toggleScreenShare}
            className={`p-3.5 rounded-full transition cursor-pointer ${
              isScreenSharing
                ? 'bg-[#00a884] text-[#111b21]'
                : 'bg-[#374248] text-[#e9edef] hover:bg-[#4a575f]'
            }`}
            title={isScreenSharing ? 'Stop Sharing Screen' : 'Share Screen'}
          >
            <Monitor className="w-5 h-5" />
          </button>
        )}

        {/* End / Leave Call Button */}
        <button
          onClick={endCall}
          className="p-3.5 bg-red-600 hover:bg-red-500 text-white rounded-full transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-red-600/30 cursor-pointer"
          title={isGroupCall ? 'Leave Group Call' : 'End Call'}
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
