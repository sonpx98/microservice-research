import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useChat } from "../store";
import { useMask } from "../mask";
import { useChannels } from "../queries";
import { MessageList } from "./MessageList";
import { Composer } from "./Composer";
import { TypingLine } from "./TypingLine";

const svgProps = {
  width: 16, height: 16, viewBox: "0 0 24 24", fill: "none",
  stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round",
} as const;

// privacy on → eye open; off → eye closed (lidded)
const EyeOpen = () => (
  <svg {...svgProps}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeClosed = () => (
  <svg {...svgProps}>
    <path d="M2 12c3 4 17 4 20 0" />
    <path d="M4 14l-1 1.5M20 14l1 1.5M12 15.5V17.5M8 15l-.6 1.8M16 15l.6 1.8" />
  </svg>
);

export function ChannelView() {
  const { channelId } = useParams();
  const setChannel = useChat((s) => s.setChannel);
  const { data: channels } = useChannels();
  const name = channels?.find((c) => c.id === channelId)?.name;
  const maskOn = useMask((s) => (channelId ? s.enabled.has(channelId) : false));
  const toggleMask = useMask((s) => s.toggle);

  useEffect(() => {
    if (channelId) setChannel(channelId);
  }, [channelId, setChannel]);

  if (!channelId) return null;
  return (
    <>
      <div className="channel-head">
        <span># {name ?? "…"}</span>
        <span className="channel-head-actions">
          <label className="switch" title={maskOn ? "Privacy on — messages hidden" : "Privacy off"}>
            <input type="checkbox" checked={maskOn} onChange={() => channelId && toggleMask(channelId)} />
            <span className="switch-track"><span className="switch-thumb" /></span>
            <span className="switch-eye" aria-hidden>{maskOn ? <EyeOpen /> : <EyeClosed />}</span>
          </label>
          <Link to="trash" className="icon-btn" title="Trash">🗑</Link>
        </span>
      </div>
      <MessageList channelId={channelId} />
      <TypingLine channelId={channelId} />
      <Composer />
    </>
  );
}
