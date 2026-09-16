import { useEffect } from "react";
import { useChat } from "../store";

// Gmail-style undo: after a delete, offer a brief window to restore. The message is already
// soft-deleted server-side; undoing restores it, otherwise the purge job hard-deletes it later.
export function UndoToast() {
  const pendingUndo = useChat((s) => s.pendingUndo);
  const undoDelete = useChat((s) => s.undoDelete);
  const dismissUndo = useChat((s) => s.dismissUndo);

  useEffect(() => {
    if (!pendingUndo) return;
    const t = setTimeout(dismissUndo, 12_000); // hide the toast; message stays recoverable until purge
    return () => clearTimeout(t);
  }, [pendingUndo, dismissUndo]);

  if (!pendingUndo) return null;
  return (
    <div className="undo-toast" role="status">
      <span>Message deleted</span>
      <button onClick={undoDelete}>Undo</button>
      <button className="undo-x" onClick={dismissUndo} title="Dismiss">✕</button>
    </div>
  );
}
