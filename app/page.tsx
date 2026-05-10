"use client";

import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");

  async function sendMessage() {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
      }),
    });

    const data = await res.json();

    setReply(data.reply);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "black",
        color: "lime",
        padding: "40px",
        fontFamily: "monospace",
      }}
    >
      <h1>AI Portal</h1>

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask the machine..."
        style={{
          width: "100%",
          padding: "12px",
          fontSize: "1rem",
          marginTop: "20px",
          background: "#111",
          color: "lime",
          border: "1px solid lime",
        }}
      />

      <button
        onClick={sendMessage}
        style={{
          marginTop: "20px",
          padding: "12px 24px",
          background: "lime",
          color: "black",
          border: "none",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Send
      </button>

      <div
        style={{
          marginTop: "40px",
          whiteSpace: "pre-wrap",
        }}
      >
        {reply}
      </div>
    </main>
  );
}