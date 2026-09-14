export interface ChatMessage {
  id: string;
  clientMsgId?: string | null;
  channelId: string;
  userId: string;
  name: string;
  text: string;
  ts: number;
  pending?: boolean; // true while an optimistic message awaits the server echo
}

export interface PresenceUser {
  id: string;
  name: string;
}

export interface Channel {
  id: string;
  name: string;
}
