
"use client";

import { useEffect, useState } from "react";
import CoBrowsingRoom from "./components/CoBrowsingRoom";
import { supabase } from "./lib/supabaseClient";

export default function CoBrowsingPage() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [joinId, setJoinId] = useState("");
  const [userName, setUserName] = useState("");
  const [userId] = useState(() => crypto.randomUUID());

  const createRoom = async () => {
    if (!userName.trim()) {
        alert("Please enter your name first!");
        return;
    }
    
    // Create room in Supabase
    const { data, error } = await supabase
      .from("rooms")
      .insert([{ host_id: userId }]) // Set Creator as initial Host
      .select()
      .single();

    if (data) {
        setRoomId(data.id);
    } else {
        console.error("Room creation failed:", error);
        alert(`Failed to create room: ${error?.message || "Unknown error"}. Did you create the 'rooms' table?`);
    }
  };

  const joinRoom = () => {
      if (!userName.trim()) {
          alert("Please enter your name first!");
          return;
      }
      if (joinId) setRoomId(joinId);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 top-16 bg-gray-950 text-white overflow-hidden">
      {!roomId ? (
        <div className="flex flex-col items-center justify-center h-full space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Realtime Co-browsing
            </h1>
            <p className="text-gray-400">Share your screen instantly with low latency</p>
          </div>
          
          <div className="flex flex-col gap-4 w-full max-w-sm">
             {/* Name Input */}
             <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-400 ml-1">Your Name</label>
                <input 
                   type="text" 
                   value={userName}
                   onChange={(e) => setUserName(e.target.value)}
                   placeholder="Enter your name..." 
                   className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                />
             </div>

            <button 
              onClick={createRoom}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg shadow-blue-500/20"
            >
              Create New Room
            </button>
            
            <div className="flex items-center gap-4 w-full">
                <div className="h-px bg-white/10 flex-1" />
                <span className="text-gray-500 text-sm">OR</span>
                <div className="h-px bg-white/10 flex-1" />
            </div>

            <div className="flex gap-2">
                <input 
                   type="text" 
                   value={joinId}
                   onChange={(e) => setJoinId(e.target.value)}
                   placeholder="Enter Room ID" 
                   className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button 
                   onClick={joinRoom}
                   className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold transition-all shadow-lg shadow-purple-500/20"
                >
                   Join
                </button>
            </div>
          </div>
        </div>
      ) : (
        <CoBrowsingRoom roomId={roomId} userId={userId} userName={userName} onLeave={() => setRoomId(null)} />
      )}
    </div>
  );
}
