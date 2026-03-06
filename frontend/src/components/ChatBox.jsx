import { useEffect, useState } from "react";
import { connectSocket, getSocket } from "../services/socket";
import api from "../services/api";
function ChatBox({ orgId }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentUser = localStorage.getItem("name");

  useEffect(() => {
    if (!orgId) {
      setError("Organization ID is missing");
      setLoading(false);
      return;
    }
    
      const loadMessages = async () => {
  try {

    const res = await api.get(`/messages/${orgId}`);

    const history = res.data.map((msg) => ({
      sender: msg.senderName,
      message: msg.message,
      timestamp: msg.createdAt,
    }));

    setMessages(history);

  } catch (error) {
    console.error("Error loading messages", error);
  }
};

loadMessages();
    const socket = connectSocket();

    // join organization room
    socket.emit("join_org", orgId);

    const handleConnect = () => {
      setLoading(false);
    };

    const handleReceiveMessage = (data) => {
      setMessages((prev) => [
        ...prev,
        {
          sender: data.sender,
          message: data.message,
          timestamp: data.timestamp || new Date(),
        },
      ]);
    };

    const handleMemberJoined = (data) => {
      setMessages((prev) => [
        ...prev,
        {
          system: true,
          text: `${data.name} joined the organization`,
        },
      ]);
    };

    if (socket.connected) {
      setLoading(false);
    } else {
      socket.on("connect", handleConnect);
    }

    socket.on("receive_message", handleReceiveMessage);
    socket.on("member_joined", handleMemberJoined);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("receive_message", handleReceiveMessage);
      socket.off("member_joined", handleMemberJoined);
    };
  }, [orgId]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!inputMessage.trim()) return;

    const socket = getSocket();

    socket.emit("send_message", {
      orgId,
      message: inputMessage,
    });

    setInputMessage("");
  };

  if (loading) {
    return (
      <div className="text-center py-4 text-gray-500">
        Connecting to chat...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">

      {/* MESSAGE AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">

        {messages.length === 0 && (
          <p className="text-gray-400 text-center">
            No messages yet. Start the conversation!
          </p>
        )}

        {messages.map((msg, idx) => {

          if (msg.system) {
            return (
              <div key={idx} className="text-center text-gray-400 text-sm">
                {msg.text}
              </div>
            );
          }

          const isMe = msg.sender === currentUser;

          return (
            <div
              key={idx}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-xs ${
                  isMe
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-900"
                }`}
              >
                <p className="text-xs font-semibold">
                  {isMe ? "You" : msg.sender}
                </p>

                <p className="text-sm">{msg.message}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* INPUT AREA */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t flex gap-2"
      >
        <input
          type="text"
          placeholder="Type a message..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 rounded-lg hover:bg-blue-700 transition"
        >
          Send
        </button>
      </form>

    </div>
  );
}

export default ChatBox;