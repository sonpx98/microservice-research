// WebRTC 1-1 call store. Signaling rides the shared WebSocket (see socket.ts + server relay).
// Flow: caller sends call-request → callee accepts → caller makes the offer → callee answers →
// both trickle ICE. STUN only (localhost/same-LAN); add a TURN server for calls across NATs.
import { create } from "zustand";
import { onMessage, sendSocket } from "./socket";

type CallStatus = "idle" | "calling" | "incoming" | "connecting" | "in-call";

interface CallState {
  callStatus: CallStatus;
  peerId: string | null;
  peerName: string | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  micOn: boolean;
  camOn: boolean;
  error: string | null;
  startCall: (peerId: string, peerName: string) => void;
  acceptCall: () => void;
  rejectCall: () => void;
  endCall: (notify?: boolean) => void;
  toggleMic: () => void;
  toggleCam: () => void;
  clearError: () => void;
}

const ICE_CONFIG: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

let pc: RTCPeerConnection | null = null;
let pendingIce: RTCIceCandidateInit[] = []; // ICE that arrived before remoteDescription was set

export const useCall = create<CallState>((set, get) => ({
  callStatus: "idle",
  peerId: null,
  peerName: null,
  localStream: null,
  remoteStream: null,
  micOn: true,
  camOn: true,
  error: null,

  startCall: (peerId, peerName) => {
    if (get().callStatus !== "idle") return;
    set({ callStatus: "calling", peerId, peerName, error: null });
    sendSocket({ type: "call-request", to: peerId });
  },

  acceptCall: () => {
    const { peerId } = get();
    if (!peerId) return;
    set({ callStatus: "connecting" });
    sendSocket({ type: "call-accept", to: peerId });
    // callee waits here; the RTCPeerConnection is built when the offer arrives
  },

  rejectCall: () => {
    const { peerId } = get();
    if (peerId) sendSocket({ type: "call-reject", to: peerId });
    cleanup();
  },

  endCall: (notify = true) => {
    const { peerId } = get();
    if (notify && peerId) sendSocket({ type: "call-end", to: peerId });
    cleanup();
  },

  toggleMic: () => {
    const s = get().localStream;
    if (!s) return;
    const on = !get().micOn;
    s.getAudioTracks().forEach((t) => (t.enabled = on));
    set({ micOn: on });
  },

  toggleCam: () => {
    const s = get().localStream;
    if (!s) return;
    const on = !get().camOn;
    s.getVideoTracks().forEach((t) => (t.enabled = on));
    set({ camOn: on });
  },

  clearError: () => set({ error: null }),
}));

async function setupMedia(): Promise<MediaStream> {
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
  } catch {
    // one webcam can't feed two tabs — fall back to audio-only so local testing still works
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    useCall.setState({ camOn: false });
  }
  useCall.setState({ localStream: stream });
  return stream;
}

function createPeer(peerId: string): RTCPeerConnection {
  const peer = new RTCPeerConnection(ICE_CONFIG);
  peer.onicecandidate = (e) => {
    if (e.candidate) sendSocket({ type: "rtc-ice", to: peerId, candidate: e.candidate });
  };
  peer.ontrack = (e) => {
    useCall.setState({ remoteStream: e.streams[0], callStatus: "in-call" });
  };
  peer.onconnectionstatechange = () => {
    if (peer.connectionState === "failed" || peer.connectionState === "disconnected") {
      if (useCall.getState().callStatus !== "idle") cleanup();
    }
  };
  pc = peer;
  return peer;
}

async function flushIce() {
  if (!pc) return;
  for (const c of pendingIce) {
    try { await pc.addIceCandidate(c); } catch { /* ignore bad candidate */ }
  }
  pendingIce = [];
}

function cleanup() {
  pc?.getSenders().forEach((s) => s.track?.stop());
  pc?.close();
  pc = null;
  pendingIce = [];
  useCall.getState().localStream?.getTracks().forEach((t) => t.stop());
  useCall.setState({
    callStatus: "idle",
    peerId: null,
    peerName: null,
    localStream: null,
    remoteStream: null,
    micOn: true,
    camOn: true,
    // error left untouched so a "declined"/failure message survives the reset
  });
}

function fail(err: unknown) {
  useCall.setState({ error: err instanceof Error ? err.message : "Call failed" });
  cleanup();
}

// --- signaling handlers (runs once, at import) ---
onMessage(async (m) => {
  const from: string | undefined = m.from;
  const st = () => useCall.getState();

  switch (m.type) {
    case "call-request":
      if (st().callStatus !== "idle") { sendSocket({ type: "call-reject", to: from }); return; }
      useCall.setState({ callStatus: "incoming", peerId: from!, peerName: m.fromName ?? "Unknown", error: null });
      break;

    case "call-accept":
      // I'm the caller; callee accepted → acquire media and make the offer
      if (st().callStatus !== "calling" || from !== st().peerId) return;
      try {
        const stream = await setupMedia();
        const peer = createPeer(from!);
        stream.getTracks().forEach((t) => peer.addTrack(t, stream));
        useCall.setState({ callStatus: "connecting" });
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        sendSocket({ type: "rtc-offer", to: from, sdp: peer.localDescription });
      } catch (err) { fail(err); }
      break;

    case "rtc-offer":
      // I'm the callee; got the offer → acquire media and answer
      try {
        const stream = await setupMedia();
        const peer = createPeer(from!);
        stream.getTracks().forEach((t) => peer.addTrack(t, stream));
        await peer.setRemoteDescription(new RTCSessionDescription(m.sdp));
        await flushIce();
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        sendSocket({ type: "rtc-answer", to: from, sdp: peer.localDescription });
      } catch (err) { fail(err); }
      break;

    case "rtc-answer":
      try {
        await pc?.setRemoteDescription(new RTCSessionDescription(m.sdp));
        await flushIce();
      } catch (err) { fail(err); }
      break;

    case "rtc-ice": {
      const cand: RTCIceCandidateInit = m.candidate;
      if (pc?.remoteDescription) {
        try { await pc.addIceCandidate(cand); } catch { /* ignore */ }
      } else {
        pendingIce.push(cand); // buffer until remoteDescription exists
      }
      break;
    }

    case "call-reject":
      useCall.setState({ error: "Call declined" });
      cleanup();
      break;

    case "call-end":
      cleanup();
      break;
  }
});
