"use client";

import { useEffect, useRef, useState } from "react";
import { useWebRTC } from "../hooks/useWebRTC";
import { supabase } from "../lib/supabaseClient";
import ChatWindow from "./ChatWindow";
import { 
  PictureInPicture, 
  Copy, 
  Mic, 
  MicOff, 
  ScreenShare, 
  StopCircle, 
  LogOut 
} from "lucide-react";
import {
  PanelResizeHandle,
  Panel,
  PanelGroup,
  type ImperativePanelHandle,
} from "react-resizable-panels";

interface RoomProps {
  roomId: string;
  userId: string;
  userName: string;
  onLeave: () => void;
}

export default function CoBrowsingRoom({ roomId, userId, userName, onLeave }: RoomProps) {
  const [hostId, setHostId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const chatPanelRef = useRef<ImperativePanelHandle>(null);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  
  const isHost = hostId === userId;
  const { 
    startShare, 
    stopShare, 
    leaveRoom, 
    toggleMic,
    stream: localStream, 
    remoteVideo, 
    remoteAudio, 
    onlineUsers,
    isMuted,
    volume,
    isSpeaking
  } = useWebRTC(roomId, isHost, userId);

  const displayStream = isHost ? localStream : remoteVideo;

  // Sync Room State
  useEffect(() => {
    supabase
      .from("rooms")
      .select("host_id")
      .eq("id", roomId)
      .single()
      .then(({ data }) => {
        if (data) setHostId(data.host_id);
      });

    const channel = supabase
      .channel(`room-updates-${roomId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${roomId}` },
        (payload: any) => {
          setHostId(payload.new.host_id);
        }
      )
      .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
  }, [roomId]);

  // Attach video stream
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = displayStream;
    }
  }, [displayStream]);

  // Attach audio stream
  useEffect(() => {
      if (audioRef.current && remoteAudio) {
          audioRef.current.srcObject = remoteAudio;
          audioRef.current.play().catch(e => console.log("Autoplay blocked:", e));
      }
  }, [remoteAudio]);

  const handleTakeControl = async () => {
    await supabase.from("rooms").update({ host_id: userId }).eq("id", roomId);
  };

  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.error("Failed to toggle PiP:", err);
    }
  };

  const handleLeave = async () => {
      await leaveRoom();
      onLeave();
  };

  const toggleChat = () => {
      const panel = chatPanelRef.current;
      if (panel) {
          if (isChatCollapsed) {
              panel.expand();
          } else {
              panel.collapse();
          }
      }
  };

  return (
    <div className="h-full w-full overflow-hidden flex flex-col">
        {/* Header / Controls - Always Visible */}
          <div className="flex justify-between items-center bg-white/5 p-3 sm:p-4 border-b border-white/10 shrink-0">
             <div className="flex items-center gap-4">
                <div className="hidden sm:block">
                   <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
                      Room: {roomId.slice(0, 8)}...
                   </h2>
                   <div className="flex items-center gap-2 text-sm text-gray-400">
                     <span className={`w-2 h-2 rounded-full ${isHost ? 'bg-green-500' : 'bg-blue-500'}`} />
                     {isHost ? "You are Host" : "Viewer"}
                     <span className="w-1 h-1 rounded-full bg-gray-600" />
                     <span className="text-green-400">{onlineUsers.length} Online</span>
                   </div>
                </div>

                <div className="h-8 w-px bg-white/10 mx-2 hidden sm:block" />

                <div className="flex items-center gap-2">
                     <button 
                        onClick={() => navigator.clipboard.writeText(roomId)}
                        className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors border border-transparent hover:border-white/10"
                        title="Copy Room ID"
                     >
                        <Copy size={16} />
                     </button>
                     <button 
                        onClick={togglePiP}
                        disabled={!displayStream}
                        className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors border border-transparent hover:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Picture-in-Picture"
                     >
                        <PictureInPicture size={16} />
                     </button>
                </div>
             </div>
                
             <div className="flex items-center gap-3">
                 {/* Mic Control */}
                <button
                    onClick={toggleMic}
                    className={`p-2 rounded-lg transition-colors border relative ${
                        isMuted 
                        ? "bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20" 
                        : "bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30"
                    }`}
                    title={isMuted ? "Unmute" : "Mute"}
                    style={!isMuted ? {
                        boxShadow: `0 0 0 ${Math.min(Math.max(volume / 5, 2), 8)}px rgba(59, 130, 246, 0.3)`
                    } : {}}
                >
                    {isMuted ? (
                        <MicOff size={20} />
                    ) : (
                        <Mic size={20} />
                    )}
                </button>

                <div className="h-8 w-px bg-white/10 mx-1" />

                 {isHost ? (
                    !localStream ? (
                        <button 
                          onClick={startShare}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20"
                        >
                          <ScreenShare size={16} />
                          <span className="hidden sm:inline">Start Sharing</span>
                        </button>
                    ) : (
                        <button 
                          onClick={stopShare}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-medium transition-colors shadow-lg shadow-red-500/20"
                        >
                          <StopCircle size={16} />
                          <span className="hidden sm:inline">Stop Sharing</span>
                        </button>
                    )
                 ) : (
                    <button 
                      onClick={handleTakeControl}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-medium transition-colors cursor-pointer border border-purple-400/30 shadow-lg shadow-purple-500/20"
                    >
                      Taken Control
                    </button>
                 )}
                 
                 <div className="h-8 w-px bg-white/10 mx-1" />

                 <button 
                   onClick={handleLeave}
                   className="p-2 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-500 rounded-lg transition-colors border border-white/10 hover:border-red-500/30"
                   title="Leave Room"
                 >
                   <LogOut size={20} />
                 </button>
             </div>
          </div>

        {/* Resizable Layout */}
        <PanelGroup direction="horizontal" autoSaveId="chat-layout" className="flex-1 min-h-0">
             {/* Left Panel: Video */}
             <Panel defaultSize={75} minSize={30}>
                 <div className="h-full w-full bg-black relative flex items-center justify-center p-4">
                     {/* Video Container */}
                     <div className="w-full h-full relative flex items-center justify-center rounded-xl overflow-hidden border border-white/10">
                        {!displayStream && (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                                {isHost ? "Click Start Sharing" : "Waiting for host..."}
                            </div>
                        )}
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            muted={isHost} 
                            className="w-full h-full object-contain"
                        />
                        {/* Hidden Audio Player for Remote Stream */}
                        <audio ref={audioRef} autoPlay />
                     </div>
                 </div>
             </Panel>

             {/* Handle */}
             {/* Handle */}
             <PanelResizeHandle 
                className={`transition-all duration-300 relative flex items-center justify-center z-10 ${
                    isChatCollapsed 
                    ? 'w-4 bg-blue-600/20 hover:bg-blue-600/40 cursor-pointer border-l border-white/10' 
                    : 'w-2 bg-transparent hover:bg-blue-500/50'
                }`}
                onClick={() => {
                    if (isChatCollapsed) toggleChat();
                }}
             >
                 <div className={`w-0.5 h-8 rounded-full transition-colors ${isChatCollapsed ? 'bg-blue-400' : 'bg-white/20'}`} />
             </PanelResizeHandle>

             {/* Right Panel: Chat */}
             <Panel 
                ref={chatPanelRef}
                defaultSize={25} 
                maxSize={50}
                minSize={15}
                collapsible={true}
                onCollapse={() => setIsChatCollapsed(true)}
                onExpand={() => setIsChatCollapsed(false)}
                className={`bg-white/5 border-l border-white/10 transition-all duration-300 ease-in-out ${isChatCollapsed ? 'min-w-0 w-0 border-none' : ''}`}
             >
                <div className="h-full w-full">
                    <ChatWindow roomId={roomId} userId={userId} userName={userName} isHost={isHost} onToggle={toggleChat} />
                </div>
             </Panel>
        </PanelGroup>
    </div>
  );
}
