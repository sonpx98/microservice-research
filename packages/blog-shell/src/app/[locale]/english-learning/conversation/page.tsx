'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Play, Pause, MessageCircle, BookOpen, Loader2, Volume2, VolumeX } from 'lucide-react';
import { EnglishHero } from '../../../../components/english-learning/english-hero';

interface DialogueLine {
  speaker: string;
  text: string;
}

interface Conversation {
  _id: string;
  topic: string;
  difficulty: string;
  dialogue: DialogueLine[];
  audioGenerated?: boolean;
  createdAt: string;
}

export default function ConversationPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentLineIndexRef = useRef(-1);
  const selectedConversationRef = useRef<Conversation | null>(null);

  const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8080/api';

  // Sync refs with state
  useEffect(() => {
    currentLineIndexRef.current = currentLineIndex;
  }, [currentLineIndex]);

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${GATEWAY_URL}/conversation`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get pre-generated audio URL for a line
  const getAudioUrl = (conversationId: string, lineIndex: number): string => {
    return `${GATEWAY_URL}/conversation/${conversationId}/audio/${lineIndex}`;
  };

  // Play audio from pre-generated source
  const playLine = (lineIndex: number) => {
    const conversation = selectedConversationRef.current;
    if (!conversation) return;

    if (lineIndex < 0 || lineIndex >= conversation.dialogue.length) {
      setIsPlaying(false);
      setCurrentLineIndex(-1);
      return;
    }

    setCurrentLineIndex(lineIndex);
    currentLineIndexRef.current = lineIndex;
    setIsPlaying(true);

    if (audioRef.current) {
      audioRef.current.src = getAudioUrl(conversation._id, lineIndex);
      audioRef.current.play().catch(err => {
        console.error('Failed to play audio:', err);
        setIsPlaying(false);
      });
    }
  };

  const handleAudioEnded = useCallback(() => {
    const nextIndex = currentLineIndexRef.current + 1;
    const conversation = selectedConversationRef.current;
    
    if (conversation && nextIndex < conversation.dialogue.length) {
      playLine(nextIndex);
    } else {
      setIsPlaying(false);
      setCurrentLineIndex(-1);
    }
  }, []);

  const handleAudioError = useCallback((e: Event) => {
    console.error('Audio error:', e);
    setIsPlaying(false);
  }, []);

  // Set up audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('ended', handleAudioEnded);
      audio.addEventListener('error', handleAudioError);
      return () => {
        audio.removeEventListener('ended', handleAudioEnded);
        audio.removeEventListener('error', handleAudioError);
      };
    }
  }, [handleAudioEnded, handleAudioError]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    selectedConversationRef.current = conversation;
    setCurrentLineIndex(-1);
    setIsPlaying(false);
  };

  const startConversation = () => {
    if (!selectedConversation) return;
    playLine(0);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else if (currentLineIndex >= 0) {
      audioRef.current?.play();
      setIsPlaying(true);
    } else {
      startConversation();
    }
  };

  const taglines = [
    "Practice real-world conversations",
    "Improve your listening skills",
    "Learn natural expressions and idioms",
    "AI-powered dialogue generation"
  ];

  return (
    <div className="min-h-screen pb-20">
      <EnglishHero 
        title="Conversation Practice"
        taglines={taglines}
      />
      
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8">
          <Link 
            href="/en/english-learning" 
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 transition-colors border border-gray-700"
          >
            <BookOpen size={20} />
            Readings
          </Link>
          <Link 
            href="/en/english-learning/conversation" 
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium shadow-lg"
          >
            <MessageCircle size={20} />
            Conversations
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar: Conversation List */}
          <div className="md:col-span-1 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Topics</h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {conversations.map((conv) => (
                <div
                  key={conv._id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`p-3 rounded-lg cursor-pointer transition-all border ${
                    selectedConversation?._id === conv._id
                      ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                      : 'bg-white border-gray-200 hover:border-blue-300 dark:bg-gray-900 dark:border-gray-700'
                  }`}
                >
                  <div className="font-medium truncate flex items-center gap-2">
                    {conv.topic}
                    {conv.audioGenerated ? (
                      <Volume2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 flex justify-between">
                    <span>{conv.difficulty}</span>
                    <span>{new Date(conv.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main: Dialogue View */}
          <div className="md:col-span-2">
            {!selectedConversation ? (
              <div className="h-full flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded-xl p-12">
                Select a topic to start practicing
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col h-[600px]">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                  <div>
                    <h2 className="text-lg font-bold">{selectedConversation.topic}</h2>
                    <p className="text-sm text-gray-500">
                      {selectedConversation.difficulty}
                      {selectedConversation.audioGenerated ? (
                        <span className="ml-2 text-green-500 flex items-center gap-1 inline-flex">
                          <Volume2 className="w-3 h-3" /> Audio ready
                        </span>
                      ) : (
                        <span className="ml-2 text-amber-500">Audio generating...</span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={togglePlayPause}
                    disabled={!selectedConversation.audioGenerated}
                    className={`p-3 rounded-full shadow-lg transition-transform active:scale-95 ${
                      !selectedConversation.audioGenerated 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {selectedConversation.dialogue.map((line, idx) => (
                    <div 
                      key={idx} 
                      className={`flex flex-col ${
                        line.speaker.includes('A') ? 'items-start' : 'items-end'
                      }`}
                    >
                      <div className={`text-xs text-gray-400 mb-1 px-1`}>{line.speaker}</div>
                      <div 
                        className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed transition-all duration-300 ${
                          currentLineIndex === idx 
                            ? 'bg-blue-600 text-white shadow-md scale-[1.02]' 
                            : line.speaker.includes('A') 
                              ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200' 
                              : 'bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
                        }`}
                      >
                        {line.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
