'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Play, Pause, Loader2, Volume2, VolumeX } from 'lucide-react';
import { EnglishShell } from '@/components/english-learning/english-shell';
import { Panel, Section } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

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
  const { locale } = useParams<{ locale: string }>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const playbackRateRef = useRef(1.0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentLineIndexRef = useRef(-1);
  const selectedConversationRef = useRef<Conversation | null>(null);

  const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:3000/api';

  // Sync refs with state
  useEffect(() => {
    currentLineIndexRef.current = currentLineIndex;
  }, [currentLineIndex]);

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  // Update playback rate when state changes or audio element changes
  useEffect(() => {
    playbackRateRef.current = playbackRate;
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

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
      // Ensure playback rate is maintained when source changes
      audioRef.current.playbackRate = playbackRateRef.current;
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

  return (
    <EnglishShell
      locale={locale}
      active="conversations"
      title="Conversations"
      description="Two-speaker dialogues with per-line audio from Piper TTS."
    >
      <div className="grid gap-6 md:grid-cols-3">
        <Section title="Topics" className="md:col-span-1">
          <div className="flex max-h-[600px] flex-col gap-2 overflow-y-auto pr-1">
            {conversations.map((conv) => {
              const selected = selectedConversation?._id === conv._id;
              return (
                <Button
                  key={conv._id}
                  variant="outline"
                  onClick={() => handleSelectConversation(conv)}
                  aria-pressed={selected}
                  className={cn(
                    'h-auto w-full flex-col items-stretch gap-1 px-3 py-2.5 text-left font-normal whitespace-normal',
                    selected && 'border-primary bg-primary/10',
                  )}
                >
                  <span className="flex items-center gap-2 font-medium">
                    <span className="truncate">{conv.topic}</span>
                    {conv.audioGenerated ? (
                      <Volume2 className="text-success" />
                    ) : (
                      <VolumeX className="text-muted-foreground" />
                    )}
                  </span>
                  <span className="flex justify-between font-mono text-xs text-muted-foreground">
                    <span>{conv.difficulty}</span>
                    <span>{new Date(conv.createdAt).toLocaleDateString(locale)}</span>
                  </span>
                </Button>
              );
            })}
          </div>
        </Section>

        <div className="md:col-span-2">
          {!selectedConversation ? (
            <Panel>
              <EmptyState title="Pick a topic" description="Select a conversation on the left to start practicing." />
            </Panel>
          ) : (
            <Panel
              className="flex h-[600px] flex-col"
              padding="none"
              bodyClassName="flex min-h-0 flex-1 flex-col"
              title={selectedConversation.topic}
              description={
                <span className="flex items-center gap-2 font-mono">
                  {selectedConversation.difficulty}
                  {selectedConversation.audioGenerated ? (
                    <span className="inline-flex items-center gap-1 text-success">
                      <Volume2 className="h-3 w-3" /> audio ready
                    </span>
                  ) : (
                    <span className="text-warning">audio generating…</span>
                  )}
                </span>
              }
              actions={
                <>
                  <Select value={String(playbackRate)} onValueChange={(v) => setPlaybackRate(parseFloat(v))}>
                    <SelectTrigger size="sm" className="w-20" aria-label="Playback speed">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['0.75', '1', '1.25', '1.5'].map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}x
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="icon"
                    onClick={togglePlayPause}
                    disabled={!selectedConversation.audioGenerated}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause /> : <Play />}
                  </Button>
                </>
              }
            >
              <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
                {selectedConversation.dialogue.map((line, idx) => {
                  const isA = line.speaker.includes('A');
                  return (
                    <div key={idx} className={cn('flex flex-col', isA ? 'items-start' : 'items-end')}>
                      <div className="mb-1 px-1 font-mono text-xs text-muted-foreground">{line.speaker}</div>
                      <div
                        className={cn(
                          'max-w-[80%] rounded-lg p-4 text-sm leading-relaxed transition-colors duration-300',
                          currentLineIndex === idx
                            ? 'bg-primary text-primary-foreground'
                            : isA
                              ? 'bg-muted text-foreground'
                              : 'bg-primary/10 text-foreground',
                        )}
                      >
                        {line.text}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          )}
        </div>
      </div>

      <audio ref={audioRef} className="hidden" />
    </EnglishShell>
  );
}
