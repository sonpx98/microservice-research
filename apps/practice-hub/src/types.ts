export interface ChatMessage {
  id: string;
  clientMsgId?: string | null;
  channelId: string;
  userId: string;
  name: string;
  text: string;
  ts: number;
  editedAt?: number | null;
  reactions?: Record<string, string[]>; // emoji -> userIds who reacted
  replyTo?: string | null; // parent message id
  replyToName?: string | null; // denormalized author of the parent
  replyToPreview?: string | null; // denormalized snippet of the parent
  imageUrl?: string | null; // /uploads/<name> for an attached image
  deletedAt?: number | null; // set while soft-deleted (shown in Trash)
  pending?: boolean; // true while an optimistic message awaits the server echo
  deleting?: boolean; // true while an optimistic delete awaits confirmation
}

export interface PresenceUser {
  id: string;
  name: string;
}

export interface Channel {
  id: string;
  name: string;
}
