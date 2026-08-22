import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { soundService } from '../services/soundService';
import { callService } from '../services/callService';

const CallContext = createContext(null);

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export const CallProvider = ({ children }) => {
  const { user } = useAuth();
  const { subscribe, sendSignal } = useSocket();

  const [callState, setCallState] = useState('IDLE'); // IDLE, OUTGOING, INCOMING, CONNECTED
  const [callType, setCallType] = useState('VIDEO'); // 'AUDIO' or 'VIDEO'
  const [callPartner, setCallPartner] = useState(null);
  const [callId, setCallId] = useState(null);

  // Active Group Calls across all chats: { [chatId]: ActiveGroupCallDto }
  const [activeGroupCalls, setActiveGroupCalls] = useState({});

  // Group Call State for active session
  const [isGroupCall, setIsGroupCall] = useState(false);
  const [groupInfo, setGroupInfo] = useState(null);
  const [groupParticipants, setGroupParticipants] = useState([]); // [{ id, displayName, username, avatarUrl, stream, isLocal }]

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const peerConnectionRef = useRef(null);
  const groupPeerConnectionsRef = useRef(new Map()); // userId -> RTCPeerConnection
  const localStreamRef = useRef(null);
  const pendingCandidatesRef = useRef([]);
  const callStartTimeRef = useRef(null);
  const callPartnerRef = useRef(null);
  const callTypeRef = useRef('VIDEO');
  const isOutgoingRef = useRef(true);
  const activeGroupSubRef = useRef(null);
  const isGroupCallRef = useRef(false);
  const callIdRef = useRef(null);
  const groupInfoRef = useRef(null);

  // Fetch initial active group calls on load
  useEffect(() => {
    if (!user) return;
    const fetchActiveCalls = async () => {
      try {
        const calls = await callService.getAllActiveGroupCalls();
        if (Array.isArray(calls)) {
          const map = {};
          calls.forEach((c) => {
            if (c.chatId && c.participantIds && c.participantIds.length > 0) {
              map[c.chatId] = c;
            }
          });
          setActiveGroupCalls(map);
        }
      } catch (err) {
        console.warn('Failed to load active group calls', err);
      }
    };
    fetchActiveCalls();
  }, [user]);

  // Subscribe to global active group calls channel (/topic/group-calls)
  useEffect(() => {
    if (!user || !subscribe) return;

    const sub = subscribe('/topic/group-calls', (frame) => {
      try {
        const update = JSON.parse(frame.body);
        if (!update || !update.chatId) return;

        setActiveGroupCalls((prev) => {
          const next = { ...prev };
          if (!update.participantIds || update.participantIds.length === 0) {
            delete next[update.chatId];
          } else {
            next[update.chatId] = update;
          }
          return next;
        });
      } catch (err) {
        console.error('Error in /topic/group-calls frame', err);
      }
    });

    return () => {
      sub.unsubscribe();
    };
  }, [user, subscribe]);

  // Clean up all streams and connections
  const cleanupCall = useCallback((recordStatus = null) => {
    soundService.stopRingtone();

    let durationSeconds = 0;
    if (callStartTimeRef.current) {
      durationSeconds = Math.max(0, Math.floor((Date.now() - callStartTimeRef.current) / 1000));
    }

    if (recordStatus && callPartnerRef.current && user && !callPartnerRef.current.isGroup) {
      try {
        callService.recordCallLog({
          partnerId: callPartnerRef.current.id,
          callType: callTypeRef.current,
          status: recordStatus,
          isOutgoing: isOutgoingRef.current,
          durationSeconds: durationSeconds,
        });
      } catch (err) {
        console.warn('Failed to record call log:', err);
      }
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Close all group peer connections
    groupPeerConnectionsRef.current.forEach((pc) => {
      try {
        pc.close();
      } catch {}
    });
    groupPeerConnectionsRef.current.clear();

    if (activeGroupSubRef.current) {
      try {
        activeGroupSubRef.current.unsubscribe();
      } catch {}
      activeGroupSubRef.current = null;
    }

    pendingCandidatesRef.current = [];
    callStartTimeRef.current = null;
    callPartnerRef.current = null;
    isGroupCallRef.current = false;
    callIdRef.current = null;
    groupInfoRef.current = null;
    setRemoteStream(null);
    setCallPartner(null);
    setCallId(null);
    setIsGroupCall(false);
    setGroupInfo(null);
    setGroupParticipants([]);
    setIsMuted(false);
    setIsVideoOff(false);
    setIsScreenSharing(false);
    setCallState('IDLE');
  }, [user]);

  // 1-on-1 Peer Connection Initializer
  const createPeerConnection = useCallback((partnerId, currentCallId, type) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal({
          callId: currentCallId,
          signalType: 'ICE_CANDIDATE',
          callType: type,
          senderId: user?.id,
          senderUsername: user?.username,
          senderName: user?.displayName || user?.username,
          senderAvatar: user?.avatarUrl,
          receiverId: partnerId,
          data: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        soundService.stopRingtone();
        callStartTimeRef.current = Date.now();
        setCallState('CONNECTED');
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        endCall();
      }
    };

    return pc;
  }, [user, sendSignal]);

  // Group Peer Connection Initializer
  const createGroupPeerConnection = useCallback((peerUser, currentCallId, type, currentChatId) => {
    if (groupPeerConnectionsRef.current.has(peerUser.id)) {
      return groupPeerConnectionsRef.current.get(peerUser.id);
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    groupPeerConnectionsRef.current.set(peerUser.id, pc);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal({
          callId: currentCallId,
          signalType: 'ICE_CANDIDATE',
          callType: type,
          senderId: user?.id,
          senderUsername: user?.username,
          senderName: user?.displayName || user?.username,
          senderAvatar: user?.avatarUrl,
          targetUserId: peerUser.id,
          chatId: currentChatId,
          isGroup: true,
          data: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        const stream = event.streams[0];
        setGroupParticipants((prev) => {
          const idx = prev.findIndex((p) => p.id === peerUser.id);
          if (idx !== -1) {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], stream };
            return updated;
          }
          return [...prev, { ...peerUser, stream, isLocal: false }];
        });
      }
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    return pc;
  }, [user, sendSignal]);

  // Handle incoming signals in a group call (both from group topic and direct user topic)
  const handleGroupSignalMessage = useCallback(async (signal) => {
    if (!signal || signal.senderId === user?.id) return;

    const peerUser = {
      id: signal.senderId,
      username: signal.senderUsername,
      displayName: signal.senderName || signal.senderUsername,
      avatarUrl: signal.senderAvatar,
    };

    const currentCallId = callIdRef.current || signal.callId;
    const currentChatId = groupInfoRef.current?.id || signal.chatId;
    const type = callTypeRef.current || signal.callType || 'VIDEO';

    switch (signal.signalType) {
      case 'GROUP_CALL_JOIN':
        // Existing member creates offer for newcomer
        setGroupParticipants((prev) => {
          if (prev.some((p) => p.id === peerUser.id)) return prev;
          return [...prev, { ...peerUser, isLocal: false }];
        });

        const pc = createGroupPeerConnection(peerUser, currentCallId, type, currentChatId);
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          sendSignal({
            callId: currentCallId,
            signalType: 'OFFER',
            callType: type,
            senderId: user.id,
            senderUsername: user.username,
            senderName: user.displayName || user.username,
            senderAvatar: user.avatarUrl,
            targetUserId: peerUser.id,
            chatId: currentChatId,
            isGroup: true,
            data: offer,
          });
        } catch (err) {
          console.error('Error creating offer for group peer:', err);
        }
        break;

      case 'OFFER':
        if (signal.targetUserId === user?.id) {
          setGroupParticipants((prev) => {
            if (prev.some((p) => p.id === peerUser.id)) return prev;
            return [...prev, { ...peerUser, isLocal: false }];
          });

          const answerPc = createGroupPeerConnection(peerUser, currentCallId, type, currentChatId);
          try {
            await answerPc.setRemoteDescription(new RTCSessionDescription(signal.data));
            const answer = await answerPc.createAnswer();
            await answerPc.setLocalDescription(answer);

            sendSignal({
              callId: currentCallId,
              signalType: 'ANSWER',
              callType: type,
              senderId: user.id,
              senderUsername: user.username,
              senderName: user.displayName || user.username,
              senderAvatar: user.avatarUrl,
              targetUserId: peerUser.id,
              chatId: currentChatId,
              isGroup: true,
              data: answer,
            });
          } catch (err) {
            console.error('Error answering group offer:', err);
          }
        }
        break;

      case 'ANSWER':
        if (signal.targetUserId === user?.id) {
          const existingPc = groupPeerConnectionsRef.current.get(signal.senderId);
          if (existingPc) {
            try {
              await existingPc.setRemoteDescription(new RTCSessionDescription(signal.data));
            } catch (err) {
              console.error('Error setting remote description for answer:', err);
            }
          }
        }
        break;

      case 'ICE_CANDIDATE':
        if (signal.targetUserId === user?.id || !signal.targetUserId) {
          const peerPc = groupPeerConnectionsRef.current.get(signal.senderId);
          if (peerPc && signal.data) {
            try {
              await peerPc.addIceCandidate(new RTCIceCandidate(signal.data));
            } catch (err) {
              console.error('Error adding ICE candidate in group call:', err);
            }
          }
        }
        break;

      case 'GROUP_CALL_LEAVE':
        const leavingPc = groupPeerConnectionsRef.current.get(signal.senderId);
        if (leavingPc) {
          try {
            leavingPc.close();
          } catch {}
          groupPeerConnectionsRef.current.delete(signal.senderId);
        }
        setGroupParticipants((prev) => prev.filter((p) => p.id !== signal.senderId));
        break;

      default:
        break;
    }
  }, [user, sendSignal, createGroupPeerConnection]);

  // Start Outgoing 1-on-1 Call
  const startCall = async (partnerUser, type = 'VIDEO', chatId = null) => {
    if (!user || callState !== 'IDLE') return;

    try {
      const generatedCallId = `${user.id}_${partnerUser.id}_${Date.now()}`;
      setCallId(generatedCallId);
      callIdRef.current = generatedCallId;
      setCallType(type);
      callTypeRef.current = type;
      isOutgoingRef.current = true;
      setIsGroupCall(false);
      isGroupCallRef.current = false;

      const partnerObj = { ...partnerUser, chatId, isGroup: false };
      setCallPartner(partnerObj);
      callPartnerRef.current = partnerObj;
      setCallState('OUTGOING');

      soundService.startOutgoingRingtone();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === 'VIDEO',
        audio: true,
      });

      localStreamRef.current = stream;
      setLocalStream(stream);

      const pc = createPeerConnection(partnerUser.id, generatedCallId, type);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      sendSignal({
        callId: generatedCallId,
        signalType: 'CALL_REQUEST',
        callType: type,
        senderId: user.id,
        senderUsername: user.username,
        senderName: user.displayName || user.username,
        senderAvatar: user.avatarUrl,
        receiverId: partnerUser.id,
        chatId: chatId,
        isGroup: false,
        data: offer,
      });
    } catch (err) {
      console.error('Failed to start call', err);
      soundService.stopRingtone();
      cleanupCall();
      alert('Could not access camera/microphone. Please check browser permissions.');
    }
  };

  // Join Existing Active Group Call
  const joinActiveGroupCall = async (chatId, existingCallData = null) => {
    if (!user) return;
    const activeCall = existingCallData || activeGroupCalls[chatId];
    if (!activeCall) return;

    try {
      soundService.stopRingtone();
      setIsGroupCall(true);
      isGroupCallRef.current = true;
      const type = activeCall.callType || 'VIDEO';
      setCallType(type);
      callTypeRef.current = type;
      setCallId(activeCall.callId);
      callIdRef.current = activeCall.callId;

      const groupData = { id: chatId, name: activeCall.groupName, image: activeCall.groupImage };
      setGroupInfo(groupData);
      groupInfoRef.current = groupData;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === 'VIDEO',
        audio: true,
      });

      localStreamRef.current = stream;
      setLocalStream(stream);
      callStartTimeRef.current = Date.now();
      setCallState('CONNECTED');

      // Initialize with self
      const initialParts = [{
        id: user.id,
        username: user.username,
        displayName: user.displayName || user.username,
        avatarUrl: user.avatarUrl,
        isLocal: true,
        stream: stream,
      }];

      // Prepopulate known participants
      if (Array.isArray(activeCall.participants)) {
        activeCall.participants.forEach((p) => {
          if (p.id !== user.id && !initialParts.some((ip) => ip.id === p.id)) {
            initialParts.push({ ...p, isLocal: false });
          }
        });
      }
      setGroupParticipants(initialParts);

      // Subscribe to group call topic
      if (subscribe) {
        activeGroupSubRef.current = subscribe(`/topic/chat.${chatId}.call`, (message) => {
          try {
            const sig = JSON.parse(message.body);
            handleGroupSignalMessage(sig);
          } catch (e) {}
        });
      }

      // Broadcast join event to all other members in the group call
      sendSignal({
        callId: activeCall.callId,
        signalType: 'GROUP_CALL_JOIN',
        callType: type,
        senderId: user.id,
        senderUsername: user.username,
        senderName: user.displayName || user.username,
        senderAvatar: user.avatarUrl,
        chatId: chatId,
        isGroup: true,
      });
    } catch (err) {
      console.error('Failed to join active group call', err);
      cleanupCall();
      alert('Could not access camera/microphone to join call.');
    }
  };

  // Start New Group Call (or Join if already active)
  const startGroupCall = async (groupChat, type = 'VIDEO') => {
    if (!user || callState !== 'IDLE') return;

    // If call is already active in this group, join the existing one!
    if (activeGroupCalls[groupChat.id]) {
      return joinActiveGroupCall(groupChat.id, activeGroupCalls[groupChat.id]);
    }

    try {
      const generatedCallId = `group_${groupChat.id}_${Date.now()}`;
      setCallId(generatedCallId);
      callIdRef.current = generatedCallId;
      setCallType(type);
      callTypeRef.current = type;
      setIsGroupCall(true);
      isGroupCallRef.current = true;
      setGroupInfo(groupChat);
      groupInfoRef.current = groupChat;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === 'VIDEO',
        audio: true,
      });

      localStreamRef.current = stream;
      setLocalStream(stream);
      callStartTimeRef.current = Date.now();
      setCallState('CONNECTED');

      // Initialize participants with self
      setGroupParticipants([{
        id: user.id,
        username: user.username,
        displayName: user.displayName || user.username,
        avatarUrl: user.avatarUrl,
        isLocal: true,
        stream: stream,
      }]);

      // Subscribe to group call signaling channel
      if (subscribe) {
        activeGroupSubRef.current = subscribe(`/topic/chat.${groupChat.id}.call`, (message) => {
          try {
            const sig = JSON.parse(message.body);
            handleGroupSignalMessage(sig);
          } catch (e) {}
        });
      }

      // Notify all members about group call start
      sendSignal({
        callId: generatedCallId,
        signalType: 'GROUP_CALL_START',
        callType: type,
        senderId: user.id,
        senderUsername: user.username,
        senderName: user.displayName || user.username,
        senderAvatar: user.avatarUrl,
        chatId: groupChat.id,
        isGroup: true,
        groupName: groupChat.name,
        groupImage: groupChat.image,
      });
    } catch (err) {
      console.error('Failed to start group call', err);
      cleanupCall();
      alert('Could not access camera/microphone for group call.');
    }
  };

  // Accept Group Call from Modal
  const acceptGroupCall = async () => {
    if (!callPartner || !callId || !user) return;

    try {
      soundService.stopRingtone();
      setIsGroupCall(true);
      isGroupCallRef.current = true;
      const groupData = { id: callPartner.chatId, name: callPartner.groupName, image: callPartner.groupImage };
      setGroupInfo(groupData);
      groupInfoRef.current = groupData;
      callIdRef.current = callId;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: callType === 'VIDEO',
        audio: true,
      });

      localStreamRef.current = stream;
      setLocalStream(stream);
      callStartTimeRef.current = Date.now();
      setCallState('CONNECTED');

      // Add self to participants
      setGroupParticipants([{
        id: user.id,
        username: user.username,
        displayName: user.displayName || user.username,
        avatarUrl: user.avatarUrl,
        isLocal: true,
        stream: stream,
      }]);

      // Subscribe to group call topic
      if (subscribe && callPartner.chatId) {
        activeGroupSubRef.current = subscribe(`/topic/chat.${callPartner.chatId}.call`, (message) => {
          try {
            const sig = JSON.parse(message.body);
            handleGroupSignalMessage(sig);
          } catch (e) {}
        });
      }

      // Broadcast join event to all other members in the group call
      sendSignal({
        callId: callId,
        signalType: 'GROUP_CALL_JOIN',
        callType: callType,
        senderId: user.id,
        senderUsername: user.username,
        senderName: user.displayName || user.username,
        senderAvatar: user.avatarUrl,
        chatId: callPartner.chatId,
        isGroup: true,
      });
    } catch (err) {
      console.error('Failed to join group call', err);
      cleanupCall();
      alert('Could not access camera/microphone.');
    }
  };

  // Accept 1-on-1 incoming call
  const acceptCall = async () => {
    if (callPartner?.isGroup) {
      return acceptGroupCall();
    }

    if (!callPartner || !callId || !user) return;

    try {
      soundService.stopRingtone();
      callStartTimeRef.current = Date.now();
      callIdRef.current = callId;
      setCallState('CONNECTED');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: callType === 'VIDEO',
        audio: true,
      });

      localStreamRef.current = stream;
      setLocalStream(stream);

      const pc = createPeerConnection(callPartner.id, callId, callType);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      if (callPartner.offer) {
        await pc.setRemoteDescription(new RTCSessionDescription(callPartner.offer));

        while (pendingCandidatesRef.current.length > 0) {
          const candidate = pendingCandidatesRef.current.shift();
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        sendSignal({
          callId: callId,
          signalType: 'CALL_ACCEPT',
          callType: callType,
          senderId: user.id,
          senderUsername: user.username,
          senderName: user.displayName || user.username,
          senderAvatar: user.avatarUrl,
          receiverId: callPartner.id,
          data: answer,
        });
      }
    } catch (err) {
      console.error('Failed to accept call', err);
      rejectCall();
      alert('Could not access camera/microphone.');
    }
  };

  // Reject Call
  const rejectCall = () => {
    if (callPartner && callId && user) {
      sendSignal({
        callId: callId,
        signalType: 'CALL_REJECT',
        callType: callType,
        senderId: user.id,
        senderUsername: user.username,
        receiverId: callPartner.id,
      });
    }
    soundService.playEndCallTone();
    cleanupCall('REJECTED');
  };

  // End Call (or Leave Group Call)
  const endCall = () => {
    if (isGroupCall && groupInfo && user) {
      sendSignal({
        callId: callId,
        signalType: 'GROUP_CALL_LEAVE',
        callType: callType,
        senderId: user.id,
        senderUsername: user.username,
        chatId: groupInfo.id,
        isGroup: true,
      });
      soundService.playEndCallTone();
      cleanupCall();
      return;
    }

    const wasConnected = callState === 'CONNECTED';
    if (callPartner && callId && user) {
      sendSignal({
        callId: callId,
        signalType: 'CALL_END',
        callType: callType,
        senderId: user.id,
        senderUsername: user.username,
        receiverId: callPartner.id,
      });
    }
    soundService.playEndCallTone();
    cleanupCall(wasConnected ? 'COMPLETED' : 'MISSED');
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const nextMuted = !isMuted;
        audioTracks.forEach((t) => (t.enabled = !nextMuted));
        setIsMuted(nextMuted);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        const nextVideoOff = !isVideoOff;
        videoTracks.forEach((t) => (t.enabled = !nextVideoOff));
        setIsVideoOff(nextVideoOff);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!peerConnectionRef.current && groupPeerConnectionsRef.current.size === 0) return;

    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];

        // Replace track in 1-on-1 PC
        if (peerConnectionRef.current) {
          const sender = peerConnectionRef.current.getSenders().find((s) => s.track && s.track.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
        }

        // Replace track in all group PCs
        groupPeerConnectionsRef.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
        });

        screenTrack.onended = () => {
          if (localStreamRef.current) {
            const camTrack = localStreamRef.current.getVideoTracks()[0];
            if (peerConnectionRef.current) {
              const sender = peerConnectionRef.current.getSenders().find((s) => s.track && s.track.kind === 'video');
              if (sender && camTrack) sender.replaceTrack(camTrack);
            }
            groupPeerConnectionsRef.current.forEach((pc) => {
              const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
              if (sender && camTrack) sender.replaceTrack(camTrack);
            });
          }
          setIsScreenSharing(false);
        };

        setIsScreenSharing(true);
      } else {
        if (localStreamRef.current) {
          const camTrack = localStreamRef.current.getVideoTracks()[0];
          if (peerConnectionRef.current) {
            const sender = peerConnectionRef.current.getSenders().find((s) => s.track && s.track.kind === 'video');
            if (sender && camTrack) sender.replaceTrack(camTrack);
          }
          groupPeerConnectionsRef.current.forEach((pc) => {
            const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
            if (sender && camTrack) sender.replaceTrack(camTrack);
          });
        }
        setIsScreenSharing(false);
      }
    } catch (err) {
      console.warn('Screen share error or canceled:', err);
    }
  };

  // Subscribe to personal incoming calls & direct signals
  useEffect(() => {
    if (!user?.id || !subscribe) return;

    const sub = subscribe(`/topic/call.${user.id}`, async (message) => {
      try {
        const signal = JSON.parse(message.body);

        // Direct negotiation signals for group call (OFFER / ANSWER / ICE_CANDIDATE)
        if (signal.isGroup && (signal.signalType === 'OFFER' || signal.signalType === 'ANSWER' || signal.signalType === 'ICE_CANDIDATE')) {
          handleGroupSignalMessage(signal);
          return;
        }

        switch (signal.signalType) {
          case 'CALL_REQUEST':
          case 'GROUP_CALL_START':
            if (callState !== 'IDLE') {
              sendSignal({
                callId: signal.callId,
                signalType: 'CALL_BUSY',
                senderId: user.id,
                receiverId: signal.senderId,
              });
              return;
            }

            setCallId(signal.callId);
            callIdRef.current = signal.callId;
            setCallType(signal.callType || 'VIDEO');
            callTypeRef.current = signal.callType || 'VIDEO';
            isOutgoingRef.current = false;

            const incomingPartner = {
              id: signal.senderId,
              username: signal.senderUsername,
              displayName: signal.senderName || signal.senderUsername,
              avatarUrl: signal.senderAvatar,
              offer: signal.data,
              chatId: signal.chatId,
              isGroup: !!signal.isGroup,
              groupName: signal.groupName,
              groupImage: signal.groupImage,
            };

            setCallPartner(incomingPartner);
            callPartnerRef.current = incomingPartner;
            setCallState('INCOMING');
            soundService.startIncomingRingtone();
            break;

          case 'CALL_ACCEPT':
            soundService.stopRingtone();
            callStartTimeRef.current = Date.now();
            setCallState('CONNECTED');
            if (peerConnectionRef.current && signal.data) {
              await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signal.data));
              while (pendingCandidatesRef.current.length > 0) {
                const candidate = pendingCandidatesRef.current.shift();
                await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
              }
            }
            break;

          case 'ICE_CANDIDATE':
            if (signal.data) {
              if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
                await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(signal.data));
              } else {
                pendingCandidatesRef.current.push(signal.data);
              }
            }
            break;

          case 'CALL_REJECT':
          case 'CALL_BUSY':
            soundService.playEndCallTone();
            cleanupCall('REJECTED');
            break;

          case 'CALL_END':
            soundService.playEndCallTone();
            cleanupCall(callState === 'CONNECTED' ? 'COMPLETED' : 'MISSED');
            break;

          default:
            break;
        }
      } catch (err) {
        console.error('Error processing call signal:', err);
      }
    });

    return () => {
      sub.unsubscribe();
    };
  }, [user?.id, subscribe, callState, sendSignal, cleanupCall, handleGroupSignalMessage]);

  return (
    <CallContext.Provider
      value={{
        callState,
        callType,
        callPartner,
        activeGroupCalls,
        isGroupCall,
        groupInfo,
        groupParticipants,
        localStream,
        remoteStream,
        isMuted,
        isVideoOff,
        isScreenSharing,
        startCall,
        startGroupCall,
        joinActiveGroupCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleVideo,
        toggleScreenShare,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};
