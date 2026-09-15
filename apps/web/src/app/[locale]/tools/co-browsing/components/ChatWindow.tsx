"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { ChevronRight, Smile } from "lucide-react";

interface ChatWindowProps {
  roomId: string;
  userId: string;
  userName: string;
  isHost: boolean;
  onToggle: () => void;
}

interface Message {
  id: number;
  created_at: string;
  room_id: string;
  sender_id: string;
  sender_name?: string;
  content: string;
}

export default function ChatWindow({ roomId, userId, userName, isHost, onToggle }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        const scrollHeight = textareaRef.current.scrollHeight;
        if (scrollHeight > 96) {
            textareaRef.current.style.height = "96px";
            textareaRef.current.style.overflowY = "auto";
        } else {
            textareaRef.current.style.height = `${scrollHeight}px`;
            textareaRef.current.style.overflowY = "hidden";
        }
    }
  }, [newMessage]);

  // 1. Fetch initial messages
  useEffect(() => {
    supabase
      .from("room_messages")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
            console.error("Error fetching messages:", error);
        }
        if (data) {
            setMessages(data);
        }
      });
  }, [roomId]);

  // 2. Subscribe to new messages
  useEffect(() => {
    const channel = supabase
      .channel(`chat-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "room_messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;

    const content = newMessage.trim();
    setNewMessage(""); // Optimistic clear
    setShowEmojiPicker(false);

    const { error } = await supabase.from("room_messages").insert({
      room_id: roomId,
      sender_id: userId,
      sender_name: userName,
      content: content,
    });

    if (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message: " + error.message);
    }
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
  };

  return (
    <div className="flex flex-col h-full bg-white/5 w-full flex-shrink-0">
      <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
        <h3 className="font-bold text-gray-200">Chat</h3>
        <button 
           onClick={onToggle}
           className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
           title="Collapse Chat"
        >
            <ChevronRight size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map((msg) => {
          const isMe = msg.sender_id === userId;
          const displayName = msg.sender_name || msg.sender_id.slice(0, 4);
          
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] px-3 py-2 rounded-lg text-sm whitespace-pre-wrap break-words ${
                  isMe
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white/10 text-gray-200 rounded-bl-none"
                }`}
              >
                {msg.content}
              </div>
              <span className="text-[10px] text-gray-500 mt-1 px-1">
                {isMe ? "You" : displayName} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-white/10 bg-black/20 relative">
        {showEmojiPicker && (
            <div className="absolute bottom-16 right-4 z-10 shadow-xl rounded-xl overflow-hidden">
                <EmojiPicker 
                    onEmojiClick={onEmojiClick}
                    theme={Theme.DARK}
                    width={300}
                    height={350}
                />
            </div>
        )}
        
        <form
          onSubmit={handleSend}
          className="flex gap-2 items-end" // Align items to bottom so button stays down
        >
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 mb-1 text-gray-400 hover:text-yellow-400 transition-colors rounded-lg hover:bg-white/5"
          >
            <Smile size={20} />
          </button>

          <textarea
            ref={textareaRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none min-h-[38px]"
            style={{ lineHeight: "1.5" }}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-3 py-2 mb-0.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors h-[38px]"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
