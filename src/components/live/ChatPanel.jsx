import { useLocalParticipant, useRoomContext } from "@livekit/components-react";
import { useEffect, useRef, useState } from "react";
import { IoSend } from "react-icons/io5";

export default function ChatPanel({ role }) {
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext();

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);

  const isPresenter = role === "PRESENTER";

  /* =====================================
     AUTO SCROLL
  ===================================== */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* =====================================
     RECEIVE MESSAGES
  ===================================== */
  useEffect(() => {
    if (!room) return;

    const handleData = (payload, participant) => {
      try {
        const text = new TextDecoder().decode(payload);
        const msg = JSON.parse(text);

        // ignore raise-hand / lower-hand signals
        if (msg.type === "raise-hand" || msg.type === "lower-hand") return;

        // chat message
        if (msg.type === "chat") {
          setMessages((prev) => [
            ...prev,
            {
              sender: participant?.name || participant?.identity || "Unknown",
              text: msg.text,
              isMe: false,
              time: Date.now(),
            },
          ]);
        }
      } catch {}
    };

    room.on("dataReceived", handleData);
    return () => room.off("dataReceived", handleData);
  }, [room]);

  /* =====================================
     SEND MESSAGE
  ===================================== */
  const sendMessage = async () => {
    if (!input.trim()) return;

    try {
      const encoder = new TextEncoder();
      await localParticipant.publishData(
        encoder.encode(JSON.stringify({ type: "chat", text: input.trim() })),
        { reliable: true }
      );

      // add to own messages locally
      setMessages((prev) => [
        ...prev,
        {
          sender: "You",
          text: input.trim(),
          isMe: true,
          time: Date.now(),
        },
      ]);

      setInput("");
    } catch (e) {
      console.error("sendMessage failed", e);
    }
  };

  /* =====================================
     FORMAT TIME
  ===================================== */
  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="chat-panel">
      <div className="chat-header">Chat</div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <p className="chat-empty">No messages yet. Say hello!</p>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`chat-row ${msg.isMe ? "me" : "other"}`}>
            <div
              className={`chat-bubble ${msg.isMe ? "me-bubble" : ""} ${
                !msg.isMe && isPresenter ? "teacher-bubble" : ""
              }`}
            >
              <span className="chat-name">{msg.sender}</span>
              <div className="chat-text">{msg.text}</div>
              <div className="chat-time">{formatTime(msg.time)}</div>
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      <div className="chat-input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button className="chat-send-btn" onClick={sendMessage} title="Send">
          <IoSend size={16} />
        </button>
      </div>
    </div>
  );
}
