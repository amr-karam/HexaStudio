'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { Socket } from 'socket.io-client';
import { useXRStore } from '../store/xr-store';

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const STUN_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

/** RMS volume threshold above which a peer is considered "speaking". */
const SPEAKING_THRESHOLD = 0.025;

/** Interval (ms) at which we poll analyser nodes for speaking detection. */
const SPEAKING_POLL_MS = 200;

/** How long (ms) after the last detected speech we keep a peer in `speakingPeers`. */
const SPEAKING_HYSTERESIS_MS = 600;

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export type ConnectionQuality = 'good' | 'fair' | 'poor';

export interface UseWebRTCResult {
  /** Whether the local microphone audio stream is active. */
  isAudioEnabled: boolean;
  /** Whether the local microphone is muted. */
  isMicMuted: boolean;
  /** Socket IDs of peers currently detected as speaking. */
  speakingPeers: string[];
  /** Aggregate connection quality across all peers. */
  connectionQuality: ConnectionQuality;
  /** Number of active RTCPeerConnections. */
  peerConnections: number;
  /** Toggle mute/unmute on the local microphone (keeps stream alive). */
  toggleMic: () => void;
  /** Enable/disable the entire local audio stream. */
  toggleAudio: () => void;
}

/* -------------------------------------------------------------------------- */
/*  Hook                                                                       */
/* -------------------------------------------------------------------------- */

export function useWebRTC(
  projectId: string | null,
  mode: 'ar' | 'vr' | null,
  getSocket: () => Socket | null,
): UseWebRTCResult {
  // ─── Derived state (synced to store) ──────────────────────────────────
  const [isAudioEnabled, setAudioEnabledState] = useState(false);
  const [isMicMuted, setMicMutedState] = useState(false);
  const [speakingPeers, setSpeakingPeersState] = useState<string[]>([]);
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>('good');
  const [peerConnections, setPeerConnections] = useState(0);

  const storeSetAudioEnabled = useXRStore((s) => s.setAudioEnabled);
  const storeSetMicMuted = useXRStore((s) => s.setMicMuted);
  const storeSetSpeakingPeers = useXRStore((s) => s.setSpeakingPeers);

  // ─── Refs ─────────────────────────────────────────────────────────────
  const peerConnectionMapRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRefsRef = useRef<Map<string, AnalyserNode>>(new Map());
  const speakingTimestampsRef = useRef<Map<string, number>>(new Map());
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mySocketIdRef = useRef<string | null>(null);

  // ─── Audio helpers ────────────────────────────────────────────────────

  const ensureAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new AudioContext();
      } catch {
        console.warn('[useWebRTC] AudioContext not available');
      }
    }
    // Resume if suspended (autoplay policy).
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume().catch(() => {});
    }
  }, []);

  const initLocalAudio = useCallback(async (): Promise<boolean> => {
    if (localStreamRef.current) return true;
    try {
      ensureAudioContext();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      setAudioEnabledState(true);
      storeSetAudioEnabled(true);
      return true;
    } catch (err) {
      console.warn('[useWebRTC] getUserMedia denied or unavailable:', err);
      setAudioEnabledState(false);
      storeSetAudioEnabled(false);
      return false;
    }
  }, [ensureAudioContext, storeSetAudioEnabled]);

  const stopLocalAudio = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    setAudioEnabledState(false);
    storeSetAudioEnabled(false);
    setMicMutedState(false);
    storeSetMicMuted(false);
  }, [storeSetAudioEnabled, storeSetMicMuted]);

  // ─── Speaking detection loop ──────────────────────────────────────────

  const pollSpeaking = useCallback(() => {
    const now = Date.now();
    const speaking: string[] = [];

    for (const [peerId, analyser] of analyserRefsRef.current) {
      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteTimeDomainData(data);

      let sumSquares = 0;
      for (let i = 0; i < data.length; i++) {
        const normalized = (data[i] - 128) / 128;
        sumSquares += normalized * normalized;
      }
      const rms = Math.sqrt(sumSquares / data.length);

      if (rms > SPEAKING_THRESHOLD) {
        speakingTimestampsRef.current.set(peerId, now);
      }

      const lastSpoke = speakingTimestampsRef.current.get(peerId) ?? 0;
      if (now - lastSpoke < SPEAKING_HYSTERESIS_MS) {
        speaking.push(peerId);
      }
    }

    setSpeakingPeersState(speaking);
    storeSetSpeakingPeers(speaking);
  }, [storeSetSpeakingPeers]);

  // ─── RTCPeerConnection factory ────────────────────────────────────────

  const createPeerConnection = useCallback(
    (peerId: string, socket: Socket): RTCPeerConnection => {
      // If we already have one, close first to avoid duplicates.
      const existing = peerConnectionMapRef.current.get(peerId);
      if (existing) {
        existing.close();
        peerConnectionMapRef.current.delete(peerId);
      }

      const pc = new RTCPeerConnection(STUN_SERVERS);
      peerConnectionMapRef.current.set(peerId, pc);
      setPeerConnections(peerConnectionMapRef.current.size);

      // ── Add local audio track ──────────────────────────────────────
      if (localStreamRef.current) {
        for (const track of localStreamRef.current.getAudioTracks()) {
          pc.addTrack(track, localStreamRef.current);
        }
      }

      // ── ICE candidate trickling ────────────────────────────────────
      pc.onicecandidate = (event) => {
        if (!event.candidate) return;
        socket.emit('webrtc:ice-candidate', {
          projectId,
          to: peerId,
          candidate: event.candidate.toJSON(),
        });
      };

      // ── Connection state tracking ──────────────────────────────────
      pc.oniceconnectionstatechange = () => {
        updateAggregateQuality();
      };

      // ── Remote track → speaking detection ──────────────────────────
      pc.ontrack = (event) => {
        const remoteStream = event.streams[0];
        if (!remoteStream || !audioContextRef.current) return;

        const source = audioContextRef.current.createMediaStreamSource(remoteStream);
        const analyser = audioContextRef.current.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRefsRef.current.set(peerId, analyser);
      };

      return pc;
    },
    [projectId],
  );

  // ─── Aggregate connection quality across all peers ────────────────────

  function updateAggregateQuality() {
    const map = peerConnectionMapRef.current;
    if (map.size === 0) {
      setConnectionQuality('good');
      return;
    }

    let hasPoor = false;
    let hasFair = false;

    for (const pc of map.values()) {
      const state = pc.iceConnectionState;
      if (state === 'failed' || state === 'disconnected') {
        hasPoor = true;
      } else if (state === 'checking' || state === 'new') {
        hasFair = true;
      }
    }

    if (hasPoor) setConnectionQuality('poor');
    else if (hasFair) setConnectionQuality('fair');
    else setConnectionQuality('good');
  }

  // ─── Cleanup function ─────────────────────────────────────────────────

  const cleanupAll = useCallback(() => {
    for (const [, pc] of peerConnectionMapRef.current) {
      pc.close();
    }
    peerConnectionMapRef.current.clear();
    analyserRefsRef.current.clear();
    speakingTimestampsRef.current.clear();
    setPeerConnections(0);
    setConnectionQuality('good');
    stopLocalAudio();
  }, [stopLocalAudio]);

  // ─── Main effect: socket event wiring ─────────────────────────────────

  useEffect(() => {
    if (!projectId || mode !== 'vr') return;

    const socket = getSocket();
    if (!socket) return;

    mySocketIdRef.current = socket.id ?? null;

    // Kick off audio capture.
    initLocalAudio();

    // ── Event: new peer joined → initiate WebRTC ─────────────────────
    const handlePeerJoined = async (peer: { id: string }) => {
      if (peer.id === mySocketIdRef.current) return;
      if (peerConnectionMapRef.current.has(peer.id)) return;

      const pc = createPeerConnection(peer.id, socket);

      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('webrtc:offer', {
          projectId,
          to: peer.id,
          sdp: pc.localDescription,
        });
      } catch (err) {
        console.error('[useWebRTC] createOffer failed:', err);
      }
    };

    // ── Event: received offer → create answer ────────────────────────
    const handleOffer = async (data: { from: string; sdp: RTCSessionDescriptionInit }) => {
      if (data.from === mySocketIdRef.current) return;
      if (peerConnectionMapRef.current.has(data.from)) return;

      const pc = createPeerConnection(data.from, socket);

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('webrtc:answer', {
          projectId,
          to: data.from,
          sdp: pc.localDescription,
        });
      } catch (err) {
        console.error('[useWebRTC] handleOffer failed:', err);
      }
    };

    // ── Event: received answer → set remote description ──────────────
    const handleAnswer = async (data: { from: string; sdp: RTCSessionDescriptionInit }) => {
      const pc = peerConnectionMapRef.current.get(data.from);
      if (!pc) return;

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      } catch (err) {
        console.error('[useWebRTC] setRemoteDescription (answer) failed:', err);
      }
    };

    // ── Event: ICE candidate → add it ─────────────────────────────────
    const handleIceCandidate = async (data: { from: string; candidate: RTCIceCandidateInit }) => {
      const pc = peerConnectionMapRef.current.get(data.from);
      if (!pc) return;

      try {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (err) {
        console.error('[useWebRTC] addIceCandidate failed:', err);
      }
    };

    // ── Event: peer left → tear down connection ──────────────────────
    const handlePeerLeft = (data: { id: string }) => {
      const pc = peerConnectionMapRef.current.get(data.id);
      if (pc) {
        pc.close();
        peerConnectionMapRef.current.delete(data.id);
        analyserRefsRef.current.delete(data.id);
        speakingTimestampsRef.current.delete(data.id);
        setPeerConnections(peerConnectionMapRef.current.size);
        updateAggregateQuality();
      }
    };

    socket.on('collab:peer-joined', handlePeerJoined);
    socket.on('webrtc:offer', handleOffer);
    socket.on('webrtc:answer', handleAnswer);
    socket.on('webrtc:ice-candidate', handleIceCandidate);
    socket.on('collab:peer-left', handlePeerLeft);

    return () => {
      socket.off('collab:peer-joined', handlePeerJoined);
      socket.off('webrtc:offer', handleOffer);
      socket.off('webrtc:answer', handleAnswer);
      socket.off('webrtc:ice-candidate', handleIceCandidate);
      socket.off('collab:peer-left', handlePeerLeft);

      cleanupAll();
    };
  }, [projectId, mode, getSocket, initLocalAudio, createPeerConnection, cleanupAll]);

  // ─── Speaking detection loop effect ────────────────────────────────────

  useEffect(() => {
    if (mode !== 'vr') return;

    pollIntervalRef.current = setInterval(pollSpeaking, SPEAKING_POLL_MS);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      setSpeakingPeersState([]);
      storeSetSpeakingPeers([]);
    };
  }, [mode, pollSpeaking, storeSetSpeakingPeers]);

  // ─── Public actions ────────────────────────────────────────────────────

  const toggleMic = useCallback(() => {
    if (!localStreamRef.current) return;
    const audioTracks = localStreamRef.current.getAudioTracks();
    if (audioTracks.length === 0) return;

    const currentlyEnabled = audioTracks[0].enabled;
    audioTracks.forEach((track) => {
      track.enabled = !currentlyEnabled;
    });
    const muted = currentlyEnabled; // was enabled, now disabled = muted
    setMicMutedState(muted);
    storeSetMicMuted(muted);
  }, [storeSetMicMuted]);

  const toggleAudio = useCallback(() => {
    if (isAudioEnabled) {
      stopLocalAudio();
    } else {
      initLocalAudio().then((ok) => {
        if (ok) {
          // Re-add local track to all existing peer connections.
          const stream = localStreamRef.current;
          if (!stream) return;
          for (const pc of peerConnectionMapRef.current.values()) {
            const sender = pc.getSenders().find((s) => s.track?.kind === 'audio');
            if (sender && stream.getAudioTracks()[0]) {
              sender.replaceTrack(stream.getAudioTracks()[0]);
            } else {
              for (const track of stream.getAudioTracks()) {
                pc.addTrack(track, stream);
              }
            }
          }
        }
      });
    }
  }, [isAudioEnabled, initLocalAudio, stopLocalAudio]);

  return {
    isAudioEnabled,
    isMicMuted,
    speakingPeers,
    connectionQuality,
    peerConnections,
    toggleMic,
    toggleAudio,
  };
}
