import { useEffect, useRef } from "react";
import { useCall } from "../call";

export function CallPanel() {
  const callStatus = useCall((s) => s.callStatus);
  const peerName = useCall((s) => s.peerName);
  const localStream = useCall((s) => s.localStream);
  const remoteStream = useCall((s) => s.remoteStream);
  const micOn = useCall((s) => s.micOn);
  const camOn = useCall((s) => s.camOn);
  const acceptCall = useCall((s) => s.acceptCall);
  const rejectCall = useCall((s) => s.rejectCall);
  const endCall = useCall((s) => s.endCall);
  const toggleMic = useCall((s) => s.toggleMic);
  const toggleCam = useCall((s) => s.toggleCam);

  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localRef.current) localRef.current.srcObject = localStream;
  }, [localStream]);
  useEffect(() => {
    if (remoteRef.current) remoteRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  if (callStatus === "idle") return null;

  if (callStatus === "incoming") {
    return (
      <div className="call-overlay">
        <div className="call-card">
          <h2>Incoming call</h2>
          <p>{peerName} is calling…</p>
          <div className="call-actions">
            <button className="accept" onClick={acceptCall}>Accept</button>
            <button className="hangup" onClick={rejectCall}>Decline</button>
          </div>
        </div>
      </div>
    );
  }

  if (callStatus === "calling" || callStatus === "connecting") {
    return (
      <div className="call-overlay">
        <div className="call-card">
          <h2>{callStatus === "calling" ? "Calling…" : "Connecting…"}</h2>
          <p>{peerName}</p>
          {localStream && <video ref={localRef} autoPlay muted playsInline className="video-self small" />}
          <div className="call-actions">
            <button className="hangup" onClick={() => endCall()}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  // in-call
  return (
    <div className="call-overlay">
      <div className="call-stage">
        <video ref={remoteRef} autoPlay playsInline className="video-remote" />
        {localStream && <video ref={localRef} autoPlay muted playsInline className="video-self" />}
        <div className="call-bar">
          <button data-off={!micOn} onClick={toggleMic}>{micOn ? "🎙 Mic" : "🔇 Muted"}</button>
          <button data-off={!camOn} onClick={toggleCam}>{camOn ? "📹 Cam" : "🚫 Cam"}</button>
          <button className="hangup" onClick={() => endCall()}>Hang up</button>
        </div>
      </div>
    </div>
  );
}
