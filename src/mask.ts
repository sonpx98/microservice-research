import { create } from "zustand";

// Privacy mask: hide message content behind redaction bars so a bystander can't read the screen.
// Purely visual (shoulder-surf protection) — not encryption. Enabled PER CHANNEL.
const KEY = "fph-mask-channels";

interface MaskState {
  enabled: Set<string>; // channelIds with privacy on (persisted)
  revealed: Set<string>; // individually revealed messageIds (ephemeral)
  toggle: (channelId: string) => void;
  reveal: (messageId: string) => void;
}

function load(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch { return new Set(); }
}
function save(s: Set<string>) {
  try { localStorage.setItem(KEY, JSON.stringify([...s])); } catch { /* private mode */ }
}

export const useMask = create<MaskState>((set, get) => ({
  enabled: load(),
  revealed: new Set(),

  toggle: (channelId) => {
    const enabled = new Set(get().enabled);
    enabled.has(channelId) ? enabled.delete(channelId) : enabled.add(channelId);
    save(enabled);
    set({ enabled, revealed: new Set() }); // re-mask everything on toggle
  },

  reveal: (messageId) => set((s) => ({ revealed: new Set(s.revealed).add(messageId) })),
}));

// masked = this channel's privacy is on AND the message hasn't been individually revealed
export function isMasked(state: MaskState, channelId: string, messageId: string): boolean {
  return state.enabled.has(channelId) && !state.revealed.has(messageId);
}
