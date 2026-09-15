
import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
    ],
};

export const useWebRTC = (roomId: string, isHost: boolean, userId: string) => {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [remoteVideo, setRemoteVideo] = useState<MediaStream | null>(null);
    const [remoteAudio, setRemoteAudio] = useState<MediaStream | null>(null);
    const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
    const [isMuted, setIsMuted] = useState(true);
    const [volume, setVolume] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Refs
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const channelRef = useRef<RealtimeChannel | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    // Track presence keys (user IDs)
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

    const debugLog = (msg: string) => console.log(`[WebRTC] ${msg}`);

    // Helper to renegotiate connection
    const renegotiate = async () => {
        const pc = peerConnectionRef.current;
        if (!pc) return;
        try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            await channelRef.current?.send({
                type: 'broadcast',
                event: 'offer',
                payload: offer,
            });
        } catch (err) {
            console.error('Renegotiation failed:', err);
        }
    };

    // Audio Analysis Logic
    const startAudioAnalysis = (stream: MediaStream) => {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser); // Connect source to analyser only (no output to avoid feedback)

            audioContextRef.current = audioContext;
            analyserRef.current = analyser;

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const analyze = () => {
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    sum += dataArray[i];
                }
                const average = sum / bufferLength;

                // Update State
                setVolume(average);
                setIsSpeaking(average > 10); // Threshold

                animationFrameRef.current = requestAnimationFrame(analyze);
            };
            analyze();
        } catch (e) {
            console.error('Audio analysis failed:', e);
        }
    };

    const stopAudioAnalysis = () => {
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        setVolume(0);
        setIsSpeaking(false);
    };

    // 1. Initialize Peer Connection & Signaling
    useEffect(() => {
        if (!roomId || !userId) return;

        // Create RTCPeerConnection
        peerConnectionRef.current = new RTCPeerConnection(ICE_SERVERS);
        const pc = peerConnectionRef.current;

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                channelRef.current?.send({
                    type: 'broadcast',
                    event: 'ice-candidate',
                    payload: event.candidate,
                });
            }
        };

        pc.ontrack = (event) => {
            debugLog(`Track received: ${event.track.kind}`);
            if (event.track.kind === 'video') {
                setRemoteVideo(event.streams[0]);
            } else if (event.track.kind === 'audio') {
                setRemoteAudio(event.streams[0]);
            }
        };

        // Handle negotiation needed event
        pc.onnegotiationneeded = () => {
            debugLog('Negotiation needed triggered');
            // Manual trigger is safer for now to avoid loops, but this hook is available if needed.
        };

        // Join Channel with Presence
        const channel = supabase.channel(roomId, {
            config: {
                presence: {
                    key: userId,
                },
            },
        });

        channelRef.current = channel;

        channel
            .on('presence', { event: 'sync' }, () => {
                const newState = channel.presenceState();
                const presentUserIds = Object.keys(newState);
                console.log('Presence Sync:', presentUserIds);
                setOnlineUsers(presentUserIds);
            })
            // REMOVED isHost guards to allow symmetric negotiation
            .on('broadcast', { event: 'offer' }, async ({ payload }: { payload: RTCSessionDescriptionInit }) => {
                debugLog('Received Offer');
                if (!peerConnectionRef.current) return;

                try {
                    // Optimization: Check for collision or state?
                    if (peerConnectionRef.current.signalingState !== "stable") {
                        // If we are offering at the same time, this is a glare.
                        // Ideally we rollback, but for simplicity we rely on polite peer or just proceed.
                        await Promise.all([
                            peerConnectionRef.current.setLocalDescription({ type: "rollback" }),
                            peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(payload))
                        ]);
                    } else {
                        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(payload));
                    }

                    const answer = await peerConnectionRef.current.createAnswer();
                    await peerConnectionRef.current.setLocalDescription(answer);

                    await channel.send({
                        type: 'broadcast',
                        event: 'answer',
                        payload: answer
                    });
                } catch (e) {
                    console.error('Error handling offer:', e);
                }
            })
            .on('broadcast', { event: 'answer' }, async ({ payload }: { payload: RTCSessionDescriptionInit }) => {
                debugLog('Received Answer');
                if (!peerConnectionRef.current) return;
                try {
                    // Only set remote desc if we are expecting an answer?
                    // WebRTC will throw if state is stable, so try-catch handles stray answers.
                    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(payload));
                } catch (e) {
                    console.error('Error setting remote desc (answer):', e);
                }
            })
            .on('broadcast', { event: 'ice-candidate' }, async ({ payload }: { payload: RTCIceCandidateInit }) => {
                if (!peerConnectionRef.current) return;
                try {
                    await peerConnectionRef.current.addIceCandidate(payload);
                } catch (e) {
                    console.error('Error adding ice candidate', e);
                }
            })
            .on('broadcast', { event: 'stop-screen-share' }, () => {
                console.log('[WebRTC] Received Stop Share Signal');
                setRemoteVideo(null);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({ online_at: new Date().toISOString(), user_id: userId });
                }
            });

        return () => {
            if (stream) stream.getTracks().forEach((track) => track.stop());
            if (audioStream) audioStream.getTracks().forEach((track) => track.stop());
            stopAudioAnalysis();
            if (pc) pc.close();
            if (channel) supabase.removeChannel(channel);
        };
    }, [roomId, userId]); // Dependency on isHost removed!

    // 2. Screen Share (Host Only)
    const startShare = async () => {
        try {
            const localStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true, // System audio
            });

            setStream(localStream);
            const pc = peerConnectionRef.current;
            if (!pc) return;

            localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
            await renegotiate();
        } catch (err) {
            console.error('Error starting share:', err);
        }
    };

    const stopShare = async () => {
        if (!stream) return;

        // Stop screen tracks
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);

        // Remove from PC
        const pc = peerConnectionRef.current;
        if (pc) {
            const senders = pc.getSenders();
            senders.forEach(sender => {
                // Remove only video/screen audio tracks (careful not to kill Mic)
                // Or just remove tracks that match the stream ID?
                // Simple approach: Remove video tracks and assume Audio is Mic if toggleMic used seperate stream logic?
                // Actually standard addTrack sets sender.track
                if (sender.track && stream.getTracks().includes(sender.track)) {
                    pc.removeTrack(sender);
                }
            });
            await renegotiate();
        }

        // Notify peers strictly
        await channelRef.current?.send({
            type: 'broadcast',
            event: 'stop-screen-share',
            payload: {}
        });
    };

    const toggleMic = async () => {
        const pc = peerConnectionRef.current;
        if (!pc) return;

        if (isMuted) {
            // Unmute: Get Stream & Add Track
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                    }
                });

                setAudioStream(stream);
                setIsMuted(false);
                startAudioAnalysis(stream);

                stream.getTracks().forEach(track => {
                    pc.addTrack(track, stream);
                    track.onended = () => {
                        toggleMic(); // Toggle off if device disconnected
                    };
                });

                await renegotiate();
            } catch (err) {
                console.error("Error accessing microphone:", err);
                alert("Could not access microphone.");
            }
        } else {
            // Mute: Stop Stream & Remove Track
            if (audioStream) {
                audioStream.getTracks().forEach(t => t.stop());
                stopAudioAnalysis();
                setAudioStream(null);
                setIsMuted(true);

                const senders = pc.getSenders();
                senders.forEach(sender => {
                    // Robust check: match track ID or label
                    if (sender.track && audioStream.getTracks().some(t => t.id === sender.track!.id)) {
                        pc.removeTrack(sender);
                    }
                });
                await renegotiate();
            }
        }
    };

    const leaveRoom = async () => {
        const isLastPerson = onlineUsers.length <= 1;
        console.log('Leaving room. Active Users:', onlineUsers.length, 'Last person?', isLastPerson);

        // Cleanup local
        if (stream) stream.getTracks().forEach(t => t.stop());
        if (audioStream) audioStream.getTracks().forEach(t => t.stop());
        setStream(null);
        setAudioStream(null);
        stopAudioAnalysis();

        if (peerConnectionRef.current) peerConnectionRef.current.close();
        if (channelRef.current) await supabase.removeChannel(channelRef.current);

        if (isLastPerson) {
            await supabase.from('room_messages').delete().eq('room_id', roomId);
            await supabase.from('rooms').delete().eq('id', roomId);
        }
    };

    return {
        startShare,
        stopShare,
        toggleMic,
        leaveRoom,
        stream,      // Local Screen Stream
        remoteVideo, // Remote Screen Stream
        remoteAudio, // Remote Audio Stream
        isMuted,
        volume,
        isSpeaking,
        onlineUsers
    };
};
