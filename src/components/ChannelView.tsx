import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useChat } from "../store";
import { MessageList } from "./MessageList";
import { Composer } from "./Composer";
import { TypingLine } from "./TypingLine";

export function ChannelView() {
  const { channelId } = useParams();
  const setChannel = useChat((s) => s.setChannel);

  useEffect(() => {
    if (channelId) setChannel(channelId);
  }, [channelId, setChannel]);

  if (!channelId) return null;
  return (
    <>
      <MessageList channelId={channelId} />
      <TypingLine channelId={channelId} />
      <Composer />
    </>
  );
}
