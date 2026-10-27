
import { useState, useEffect, useRef } from "react";
import "./Chatbot.css";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! Welcome to DriveEasy. How can I help you with your vehicle rental today?",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // Automatically scroll to the latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages, loading, isOpen]);

  async function sendMessage(e) {
    e.preventDefault();

    const text = message.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { sender: "user", text }]);
    setMessage("");
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL;

const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to get a response.");
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: data.reply || "Sorry, I couldn't answer that.",
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry, I cannot connect right now. Please try again later.",
        },
      ]);
      console.error("Chatbot error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div>
              <strong>DriveEasy Assistant</strong>
              <small>Ask us about vehicle rentals</small>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
            >
              ×
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((item, index) => (
              <div
                key={index}
                className={`chatbot-message ${item.sender}`}
              >
                {item.text}
              </div>
            ))}

            {loading && (
              <div className="chatbot-message bot">
                Typing...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input" onSubmit={sendMessage}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              aria-label="Type your message"
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading || !message.trim()}
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className="chatbot-toggle"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? "×" : "💬"}
      </button>
    </div>
  );
}
