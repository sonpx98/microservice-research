import { useChat } from "../store";

export function TypingLine({ channelId }: { channelId: string }) {
  const typing = useChat((s) => s.typing);
  const me = useChat((s) => s.name);
  if (typing.channelId !== channelId) return null;
  const others = typing.users.filter((n) => n !== me);
  if (!others.length) return null;
  return (
    <div className="typing" aria-live="polite">
      {others.join(", ")} {others.length === 1 ? "is" : "are"} typing…
    </div>
  );
}
